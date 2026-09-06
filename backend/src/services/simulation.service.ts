/**
 * Deal Strategy Simulator Service
 * Aligned with Database.md §4.4, API.md §6, and Microeconomic Behavioral Elasticity
 */

import { prisma } from '../config/database';
import { AppError } from '../utils/appError';
import { Role } from '@prisma/client';
import {
  ISimulationRunRequest,
  ISimulationRunResponse,
  ISimulationScenario,
  IPredictedCustomerResponse,
  IApplySimulationRequest,
  IApplySimulationResponse,
  InferredCustomerChatProfile,
  ISimulationWhatIfOverrides,
} from '../types/simulation.types';
import { chatBehavioralExtractorService } from './chatBehavioralExtractor.service';
import { auditLogRepository } from '../repositories/auditLog.repository';

export class SimulationService {
  /**
   * Calculate behavioral probabilities (Win, Walk-away, Negotiation)
   */
  public calculateBehavioralMetrics(
    offeredDiscount: number,
    baselineMin: number,
    baselineMax: number,
    priceSensitivity: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME',
    options?: {
      hasBundle?: boolean;
      hasExtendedTerms?: boolean;
      hasExpeditedDelivery?: boolean;
      serviceAffinity?: number;
    }
  ): IPredictedCustomerResponse {
    const sensitivityMultiplier =
      priceSensitivity === 'EXTREME' ? 2.0 : priceSensitivity === 'HIGH' ? 1.5 : priceSensitivity === 'MEDIUM' ? 1.0 : 0.6;

    const deficit = baselineMin - offeredDiscount;

    let acceptanceProb = 70;
    let walkAwayRisk = 8;
    let dealRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    let reasoning = '';

    if (deficit > 0) {
      // Below customer acceptable corridor -> Escalates walk-away hazard
      walkAwayRisk = Math.min(94, Math.round(15 + deficit * 7.5 * sensitivityMultiplier));
      acceptanceProb = Math.max(4, Math.round(65 - deficit * 8.5 * sensitivityMultiplier));
      dealRiskLevel = walkAwayRisk > 50 ? 'CRITICAL' : walkAwayRisk > 30 ? 'HIGH' : 'MEDIUM';
      reasoning = `Offered discount (${offeredDiscount}%) is below customer threshold (${baselineMin}%). High ${priceSensitivity} price sensitivity generates a ${walkAwayRisk}% risk that the customer terminates negotiations.`;
    } else {
      // Within or above corridor
      const surplus = offeredDiscount - baselineMin;
      acceptanceProb = Math.min(95, Math.round(72 + surplus * 2.5));
      walkAwayRisk = Math.max(3, Math.round(10 - surplus * 1.2));
      dealRiskLevel = 'LOW';
      reasoning = `Offered discount (${offeredDiscount}%) sits comfortably inside customer acceptance corridor (${baselineMin}% - ${baselineMax}%). Low churn threat.`;
    }

    // Non-price value concessions
    if (options?.hasBundle && (options?.serviceAffinity ?? 0.8) >= 0.6) {
      acceptanceProb = Math.min(95, acceptanceProb + 12);
      walkAwayRisk = Math.max(3, walkAwayRisk - 9);
      reasoning += ' Including bundled Care Pack mitigates price resistance by increasing perceived value.';
    }

    if (options?.hasExtendedTerms) {
      acceptanceProb = Math.min(95, acceptanceProb + 6);
      walkAwayRisk = Math.max(3, walkAwayRisk - 5);
      reasoning += ' Extended payment terms offer working-capital relief as a cash discount substitute.';
    }

    if (options?.hasExpeditedDelivery) {
      acceptanceProb = Math.min(95, acceptanceProb + 7);
      walkAwayRisk = Math.max(3, walkAwayRisk - 5);
      reasoning += ' Accelerated fulfillment delivery satisfies immediate operational urgency.';
    }

    const rejectionProb = walkAwayRisk;
    const negotiationProb = Math.max(0, 100 - acceptanceProb - rejectionProb);

    return {
      acceptanceProbability: acceptanceProb,
      negotiationProbability: negotiationProb,
      rejectionProbability: rejectionProb,
      walkAwayRisk,
      dealRiskLevel,
      behavioralReasoning: reasoning,
      expectedCounter:
        walkAwayRisk > 50
          ? 'Customer likely to terminate negotiations and seek competing quotes.'
          : acceptanceProb > 75
          ? 'High probability of immediate quote confirmation.'
          : 'Customer likely to ask for additional 2-3% concession or Net 60 terms.',
    };
  }

  /**
   * Dual-sided strategy simulation
   */
  public async runSimulation(request: ISimulationRunRequest): Promise<ISimulationRunResponse> {
    let quotation: any = await prisma.quotation.findFirst({
      where: {
        OR: [{ id: request.quotationId }, { quoteNumber: request.quotationId }],
      },
      include: {
        customer: {
          include: {
            negotiationProfile: true,
          },
        },
        lines: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!quotation) {
      // Fallback for newly created or in-memory draft quotations
      quotation = {
        id: request.quotationId || 'QT-DRAFT',
        quoteNumber: request.quotationId || 'QT-DRAFT',
        paymentTerms: 'Net 30',
        subtotalAmount: 1820000,
        marginPercent: 18.4,
        riskScore: 38.5,
        customer: {
          id: 'cust-draft',
          name: 'Acme Corp',
          tier: 'GOLD',
          negotiationProfile: {
            historicalMinDiscount: 8.0,
            historicalMaxDiscount: 12.0,
            priceSensitivity: 'MEDIUM',
            serviceAffinity: 0.85,
            churnRisk: 12.0,
            avgNegotiationRounds: 2,
          },
        } as any,
        lines: [
          {
            id: 'line-sim-1',
            quantity: 20,
            unitPrice: 85000,
            unitCost: 65000,
            product: { category: 'HARDWARE' },
          },
          {
            id: 'line-sim-2',
            quantity: 1,
            unitPrice: 120000,
            unitCost: 85000,
            product: { category: 'SERVICES' },
          },
        ] as any,
      } as any;
    }

    const customer = quotation.customer;
    const isNew = request.isNewCustomer || !customer?.negotiationProfile;

    // Chat Behavioral Analysis (Cold Start or incoming message analysis)
    let inferredChat: InferredCustomerChatProfile | undefined;
    if (request.chatMessage || isNew) {
      inferredChat = chatBehavioralExtractorService.analyzeChat(
        request.chatMessage || 'Customer inquiring on discount and commercial terms',
        isNew
      );
    }

    // Determine baseline corridor
    const tier = customer?.tier || 'GOLD';
    const baselineMin =
      customer?.negotiationProfile?.historicalMinDiscount
        ? Number(customer.negotiationProfile.historicalMinDiscount)
        : tier === 'ENTERPRISE'
        ? 10.0
        : tier === 'GOLD'
        ? 8.0
        : 5.0;

    const baselineMax =
      customer?.negotiationProfile?.historicalMaxDiscount
        ? Number(customer.negotiationProfile.historicalMaxDiscount)
        : tier === 'ENTERPRISE'
        ? 15.0
        : tier === 'GOLD'
        ? 12.0
        : 10.0;

    const priceSensitivity = (inferredChat?.priceSensitivity ||
      customer?.negotiationProfile?.priceSensitivity ||
      'HIGH') as 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';

    const serviceAffinity = customer?.negotiationProfile?.serviceAffinity
      ? Number(customer.negotiationProfile.serviceAffinity)
      : 0.85;

    // Calculate baseline hardware / services line values
    let totalGross = 0;
    let totalCost = 0;
    for (const l of quotation.lines) {
      const gross = Number(l.unitPrice) * l.quantity;
      const cost = Number(l.unitCost) * l.quantity;
      totalGross += gross;
      totalCost += cost;
    }

    const calculateProjectedMargin = (hwDiscount: number, srvDiscount: number, bundleGross = 0, bundleCost = 0) => {
      let netRevenue = 0;
      let costSum = totalCost + bundleCost;

      for (const l of quotation.lines) {
        const cat = (l.product as any)?.category?.name || (l.product as any)?.category || 'HARDWARE';
        const disc = cat === 'SERVICES' ? srvDiscount : hwDiscount;
        const netLine = Number(l.unitPrice) * l.quantity * (1 - disc / 100);
        netRevenue += netLine;
      }
      netRevenue += bundleGross;

      if (netRevenue <= 0) return 0;
      return Math.round(((netRevenue - costSum) / netRevenue) * 1000) / 10;
    };

    // 1. SCENARIO A: Status Quo / Aggressive Concession
    const scenarioADisc = inferredChat?.demandedDiscountPercent || 15.0;
    const scenarioAMargin = calculateProjectedMargin(scenarioADisc, scenarioADisc);
    const scenarioABehavior = this.calculateBehavioralMetrics(scenarioADisc, baselineMin, baselineMax, priceSensitivity, {
      serviceAffinity,
    });

    const scenarioA: ISimulationScenario = {
      id: 'SCENARIO_A',
      name: 'Status Quo (Customer Demand Match)',
      scenarioType: 'AGGRESSIVE',
      hardwareDiscount: scenarioADisc,
      serviceDiscount: scenarioADisc,
      paymentTerms: inferredChat?.demandedPaymentTerms || quotation.paymentTerms,
      projectedMargin: scenarioAMargin,
      projectedRiskScore: 56.0,
      requiredApprovals: ['SALES_MANAGER', 'FINANCE_OPS'],
      estimatedShipments: 2,
      predictedCustomerResponse: scenarioABehavior,
      strategicRationale: `Accedes directly to customer's requested ${scenarioADisc}% discount. Yields high immediate acceptance (${scenarioABehavior.acceptanceProbability}%), but erodes gross margin to ${scenarioAMargin}% and delays closing due to mandatory Finance sign-off.`,
      draftReplyMessage: `Hello ${customer?.name || 'Customer'},\n\nWe have reviewed your request for a ${scenarioADisc}% concession. In the interest of securing this engagement, we can match this pricing under Net 30 terms. Please confirm to proceed with provisioning.`,
    };

    // 2. SCENARIO B: AI Recommended Balanced Strategy (The Sweet Spot)
    const scenarioBHardwareDisc = Math.min(baselineMax, Math.max(baselineMin, 10.0));
    const scenarioBServiceDisc = 10.0;
    const bundleSku = 'WAR-ACC-2YR';
    const bundleGross = 25000 * 0.95; // 5% bundle discount on 25k warranty
    const bundleCost = 12000;
    const scenarioBMargin = calculateProjectedMargin(scenarioBHardwareDisc, scenarioBServiceDisc, bundleGross, bundleCost);
    const scenarioBBehavior = this.calculateBehavioralMetrics(
      scenarioBHardwareDisc,
      baselineMin,
      baselineMax,
      priceSensitivity,
      {
        hasBundle: true,
        hasExtendedTerms: true,
        hasExpeditedDelivery: inferredChat?.urgencyLevel !== 'NORMAL',
        serviceAffinity,
      }
    );

    const scenarioB: ISimulationScenario = {
      id: 'SCENARIO_B',
      name: 'AI Recommended Strategy (Value Bundle)',
      scenarioType: 'RECOMMENDED_BUNDLE',
      hardwareDiscount: scenarioBHardwareDisc,
      serviceDiscount: scenarioBServiceDisc,
      addedBundleSku: bundleSku,
      bundleDiscount: 5.0,
      paymentTerms: 'Net 45',
      expeditedDelivery: inferredChat?.urgencyLevel !== 'NORMAL',
      projectedMargin: scenarioBMargin,
      projectedRiskScore: 22.0,
      requiredApprovals: ['SALES_MANAGER'],
      estimatedShipments: 2,
      predictedCustomerResponse: scenarioBBehavior,
      strategicRationale: `Anchors hardware discount at ${scenarioBHardwareDisc}% (safely in acceptance corridor [${baselineMin}%-${baselineMax}%]). Bundles 2-Yr Care Pack (${bundleSku}) at 5% discount + Net 45 payment terms. Defends gross margin (+${Math.round(
        (scenarioBMargin - scenarioAMargin) * 10
      ) / 10}% vs Scenario A) while maintaining a high ${scenarioBBehavior.acceptanceProbability}% win rate.`,
      draftReplyMessage: `Hello ${customer?.name || 'Customer'},\n\nThank you for sharing your feedback. While we cannot sustain a ${scenarioADisc}% cash discount without impacting delivery SLAs, we want to make this work for you.\n\nWe can offer a 10% commercial discount on hardware, Net 45 payment terms, and include our 2-Year Care Pack warranty at 5% off with priority 48-hour shipment. This maximizes your total cost savings while ensuring enterprise-grade protection.`,
    };

    // 3. SCENARIO C: Margin Fortress (Conservative / Strict)
    const scenarioCDisc = Math.max(3.0, baselineMin - 3.0);
    const scenarioCMargin = calculateProjectedMargin(scenarioCDisc, scenarioCDisc);
    const scenarioCBehavior = this.calculateBehavioralMetrics(scenarioCDisc, baselineMin, baselineMax, priceSensitivity, {
      serviceAffinity,
    });

    const scenarioC: ISimulationScenario = {
      id: 'SCENARIO_C',
      name: 'Margin Defense (Conservative)',
      scenarioType: 'MARGIN_DEFENSE',
      hardwareDiscount: scenarioCDisc,
      serviceDiscount: scenarioCDisc,
      paymentTerms: quotation.paymentTerms,
      projectedMargin: scenarioCMargin,
      projectedRiskScore: 14.0,
      requiredApprovals: [],
      estimatedShipments: 2,
      predictedCustomerResponse: scenarioCBehavior,
      strategicRationale: `Maintains maximum gross margin (${scenarioCMargin}%). However, warning: ${scenarioCBehavior.walkAwayRisk}% walk-away hazard. Risk of terminating negotiations is critical for price-sensitive prospects.`,
      draftReplyMessage: `Hello ${customer?.name || 'Customer'},\n\nWe have analyzed our cost structure for this order. We can extend a maximum courtesy concession of ${scenarioCDisc}% under standard commercial terms.`,
    };

    // 4. WHAT-IF OVERRIDES (If custom sliders were submitted)
    let activeScenarios = [scenarioA, scenarioB, scenarioC];
    if (request.whatIfOverrides) {
      const overrides = request.whatIfOverrides;
      const hwD = overrides.hardwareDiscount ?? scenarioBHardwareDisc;
      const srvD = overrides.serviceDiscount ?? scenarioBServiceDisc;
      const bSku = overrides.includeBundleSku;
      const bDisc = overrides.bundleDiscount ?? 0;
      const bGross = bSku ? 25000 * (1 - bDisc / 100) : 0;
      const bCost = bSku ? 12000 : 0;
      const customMargin = calculateProjectedMargin(hwD, srvD, bGross, bCost);
      const customBehavior = this.calculateBehavioralMetrics(hwD, baselineMin, baselineMax, priceSensitivity, {
        hasBundle: !!bSku,
        hasExtendedTerms: overrides.paymentTerms === 'Net 45' || overrides.paymentTerms === 'Net 60',
        hasExpeditedDelivery: overrides.expeditedDelivery,
        serviceAffinity,
      });

      const whatIfScenario: ISimulationScenario = {
        id: 'CUSTOM_WHAT_IF',
        name: 'Custom Interactive Strategy',
        scenarioType: 'WHAT_IF',
        hardwareDiscount: hwD,
        serviceDiscount: srvD,
        addedBundleSku: bSku,
        bundleDiscount: bDisc,
        paymentTerms: overrides.paymentTerms || quotation.paymentTerms,
        expeditedDelivery: overrides.expeditedDelivery,
        projectedMargin: customMargin,
        projectedRiskScore: hwD > 15 ? 45 : 18,
        requiredApprovals: hwD > 15 ? ['SALES_MANAGER', 'FINANCE_OPS'] : hwD > 10 ? ['SALES_MANAGER'] : [],
        estimatedShipments: 2,
        predictedCustomerResponse: customBehavior,
        strategicRationale: customBehavior.behavioralReasoning,
      };

      activeScenarios = [scenarioB, whatIfScenario, scenarioA, scenarioC];
    }

    return {
      quotationId: quotation.id,
      customerProfile: {
        customerName: customer?.name || 'Customer',
        historicalDiscountRange: [baselineMin, baselineMax],
        priceSensitivity,
        serviceAffinity,
      },
      inferredChatProfile: inferredChat,
      scenarios: activeScenarios,
      activeQuotationSnapshot: {
        quoteNumber: quotation.quoteNumber || quotation.id,
        customerName: customer?.name || 'Customer',
        tier: String(tier),
        subtotalAmount: Number(quotation.subtotalAmount || 0),
        currentMargin: Number(quotation.dealMarginPercent || quotation.marginPercent || 18.4),
        currentRiskScore: Number(quotation.blendedRiskScore || quotation.riskScore || 38.5),
      },
    };
  }

  /**
   * Apply simulated scenario directly to quotation cart and database
   */
  public async applySimulation(request: IApplySimulationRequest, userId?: string): Promise<IApplySimulationResponse> {
    const quotation = await prisma.quotation.findFirst({
      where: {
        OR: [{ id: request.quotationId }, { quoteNumber: request.quotationId }],
      },
      include: {
        lines: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!quotation) {
      throw new AppError(`Quotation ${request.quotationId} not found`, 404);
    }

    // Determine discounts to apply
    let hwDiscount = 10;
    let srvDiscount = 10;
    let paymentTerms = quotation.paymentTerms;

    if (request.scenarioId === 'SCENARIO_A') {
      hwDiscount = 15;
      srvDiscount = 15;
    } else if (request.scenarioId === 'SCENARIO_B') {
      hwDiscount = 10;
      srvDiscount = 10;
      paymentTerms = 'Net 45';
    } else if (request.scenarioId === 'SCENARIO_C') {
      hwDiscount = 6;
      srvDiscount = 6;
    } else if (request.customOverrides) {
      hwDiscount = request.customOverrides.hardwareDiscount ?? hwDiscount;
      srvDiscount = request.customOverrides.serviceDiscount ?? srvDiscount;
      paymentTerms = request.customOverrides.paymentTerms ?? paymentTerms;
    }

    // Update lines in a transaction
    let newSubtotal = 0;
    let totalDiscount = 0;
    let totalCost = 0;

    for (const line of quotation.lines) {
      const cat = (line.product as any)?.category?.name || (line.product as any)?.category || 'HARDWARE';
      const disc = cat === 'SERVICES' ? srvDiscount : hwDiscount;
      const unitP = Number(line.unitPrice);
      const unitC = Number(line.unitCost);
      const gross = unitP * line.quantity;
      const discountVal = gross * (disc / 100);
      const net = gross - discountVal;

      newSubtotal += gross;
      totalDiscount += discountVal;
      totalCost += unitC * line.quantity;

      const lineMargin = net > 0 ? ((net - unitC * line.quantity) / net) * 100 : 0;

      await prisma.quotationLine.update({
        where: { id: line.id },
        data: {
          discountPercent: disc,
          netLinePrice: net,
          lineMarginPercent: lineMargin,
        },
      });
    }

    const netTaxable = newSubtotal - totalDiscount;
    const taxAmount = netTaxable * 0.18; // Standard 18% GST/Tax
    const grandTotal = netTaxable + taxAmount;
    const newMargin = netTaxable > 0 ? Math.round(((netTaxable - totalCost) / netTaxable) * 1000) / 10 : 0;
    const newRiskScore = hwDiscount > 15 ? 45.0 : hwDiscount > 10 ? 25.0 : 15.0;

    // Update parent quotation
    const updatedQuotation = await prisma.quotation.update({
      where: { id: quotation.id },
      data: {
        totalDiscountAmount: totalDiscount,
        grandTotal: grandTotal,
        dealMarginPercent: newMargin,
        blendedRiskScore: newRiskScore,
        paymentTerms,
        version: { increment: 1 },
      },
    });

    // Record DealStrategySimulation record
    await prisma.dealStrategySimulation.create({
      data: {
        quotationId: quotation.id,
        scenarioName: String(request.scenarioId),
        simulatedDiscount: hwDiscount,
        simulatedMargin: newMargin,
        simulatedRiskScore: newRiskScore,
        predictedAcceptance: 78.0,
        predictedNegotiation: 14.0,
        predictedRejection: 8.0,
        predictedCounterNote: `Applied scenario ${request.scenarioId} to quotation.`,
        configurationJson: {
          appliedAt: new Date().toISOString(),
          hardwareDiscount: hwDiscount,
          serviceDiscount: srvDiscount,
          paymentTerms,
        },
        isApplied: true,
      },
    });

    // Sync to Negotiation Thread if requested
    let threadMessageId: string | undefined;
    if (request.syncNegotiationThread && request.replyMessage) {
      const threadMsg = await prisma.customerNegotiationThread.create({
        data: {
          quotationId: quotation.id,
          authorRole: 'SALES_REP',
          authorName: 'DealOrbit Sales Rep',
          message: request.replyMessage,
          proposedDiscount: hwDiscount,
        },
      });
      threadMessageId = threadMsg.id;
    }

    // Audit log entry
    await auditLogRepository.create({
      quotationId: quotation.id,
      action: 'SUBMITTED',
      actorId: userId || null,
      reason: `Applied Deal Strategy Simulation [${request.scenarioId}]. New Margin: ${newMargin}%, Total: ₹${grandTotal.toLocaleString(
        'en-IN'
      )}.`,
      metadataJson: {
        scenarioId: request.scenarioId,
        newGrandTotal: grandTotal,
        newMargin,
        newRiskScore,
      },
    });

    return {
      quoteId: quotation.quoteNumber || quotation.id,
      version: updatedQuotation.version,
      appliedScenario: request.scenarioId,
      newGrandTotal: grandTotal,
      newMarginPercent: newMargin,
      newRiskScore: newRiskScore,
      threadMessageId,
    };
  }
}

export const simulationService = new SimulationService();
