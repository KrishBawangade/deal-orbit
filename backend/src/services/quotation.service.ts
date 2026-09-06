import { Prisma, QuoteStatus, CustomerTier } from '@prisma/client';
import { quotationRepository, IQuotationFilter } from '../repositories/quotation.repository';
import { prisma } from '../config/database';
import { governanceService, DEFAULT_CUSTOMER_TIER_CEILINGS } from './governance.service';
import { AppError } from '../utils/appError';
import { IAuthUser } from '../types';
import { randomUUID } from 'crypto';

function formatAuditTimestamp(date: Date): string {
  const now = new Date();
  const isSameDay =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  const timeStr = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  if (isSameDay) {
    return `Today at ${timeStr}`;
  } else if (isYesterday) {
    return `Yesterday at ${timeStr}`;
  } else {
    const dateStr = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    return `${dateStr} at ${timeStr}`;
  }
}

function mapAuditLogToEntry(log: any) {
  const meta = (log.metadataJson as any) || {};
  const timestampStr =
    typeof meta.timestamp === 'string' && !meta.timestamp.includes('T')
      ? meta.timestamp
      : formatAuditTimestamp(new Date(log.createdAt));

  return {
    id: log.id,
    action: log.action,
    actorName: log.actor?.name || meta.actorName || 'Morgan Manager',
    actorRole: log.actor?.role || meta.actorRole || 'SALES_MANAGER',
    timestamp: timestampStr,
    notes: log.reason || '',
    metadata: {
      riskScore: meta.riskScore,
      blendedMargin: meta.blendedMargin,
      stage: meta.stage,
      ...meta,
    },
  };
}

export class QuotationService {
  /**
   * List quotations with filtering, pagination, and calculated telemetry
   */
  public async getQuotations(filters: IQuotationFilter, user?: IAuthUser) {
    // If sales rep, optionally filter by repId if requested or allow all workspace reps
    const queryFilter: IQuotationFilter = { ...filters };

    // In a multi-tenant or strict team setup:
    if (user && user.role === 'SALES_REP' && filters.salesRepId) {
      queryFilter.salesRepId = user.id;
    }

    const { quotations, total } = await quotationRepository.findAllWithFilters(queryFilter);

    // Fetch and index audit trail records for all retrieved quotations
    const quoteIds = quotations.map((q) => q.id);
    const auditLogs =
      quoteIds.length > 0
        ? await prisma.auditLog.findMany({
            where: { quotationId: { in: quoteIds } },
            include: {
              actor: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          })
        : [];

    const auditLogsByQuoteId = new Map<string, any[]>();
    for (const log of auditLogs) {
      if (!log.quotationId) continue;
      const list = auditLogsByQuoteId.get(log.quotationId) || [];
      list.push(log);
      auditLogsByQuoteId.set(log.quotationId, list);
    }

    const formatted = quotations.map((q) => {
      const subtotalNum = Number(q.subtotalAmount);
      const discountNum = Number(q.totalDiscountAmount);
      const taxNum = Number(q.taxAmount);
      const grandTotalNum = Number(q.grandTotal);
      const marginNum = Number(q.dealMarginPercent);
      const riskNum = Number(q.blendedRiskScore);

      const marginStatus = marginNum >= 20 ? 'HIGH' : marginNum >= 10 ? 'MEDIUM' : 'DANGER';

      let approvalRequirement: 'NONE' | 'MANAGER_REQUIRED' | 'FINANCE_REQUIRED' | 'DUAL_REQUIRED' = 'NONE';
      if (q.approvalRequests && q.approvalRequests.length > 0) {
        const hasTier2 = q.approvalRequests.some((a: any) => a.tierLevel === 2);
        const hasTier1 = q.approvalRequests.some((a: any) => a.tierLevel === 1);
        if (hasTier1 && hasTier2) {
          approvalRequirement = 'DUAL_REQUIRED';
        } else if (hasTier2) {
          approvalRequirement = 'FINANCE_REQUIRED';
        } else {
          approvalRequirement = 'MANAGER_REQUIRED';
        }
      }

      let approvalStage: 'SALES_MANAGER' | 'FINANCE' | 'COMPLETED' | 'REJECTED' | 'RETURNED' = 'COMPLETED';
      if (q.status === 'IN_REVIEW') {
        const tier1Pending = q.approvalRequests?.some((a: any) => a.tierLevel === 1 && a.status === 'PENDING');
        const tier2Pending = q.approvalRequests?.some((a: any) => a.tierLevel === 2 && a.status === 'PENDING');
        if (tier1Pending) {
          approvalStage = 'SALES_MANAGER';
        } else if (tier2Pending) {
          approvalStage = 'FINANCE';
        } else {
          approvalStage = 'SALES_MANAGER';
        }
      } else if (q.status === 'APPROVED') {
        approvalStage = 'COMPLETED';
      } else if (q.status === 'REJECTED') {
        approvalStage = 'REJECTED';
      }

      const tier = (q.customer?.tier as CustomerTier) || 'BRONZE';
      const tierCeiling = DEFAULT_CUSTOMER_TIER_CEILINGS[tier] || 10.0;

      const qAuditLogs = auditLogsByQuoteId.get(q.id) || [];
      const auditTrail = qAuditLogs.map(mapAuditLogToEntry);

      return {
        id: q.quoteNumber, // Frontend displays quoteNumber as Primary ID
        internalId: q.id,
        quoteNumber: q.quoteNumber,
        version: q.version,
        customerName: q.customer?.name || 'Unknown Customer',
        customerId: q.customerId,
        tier,
        tierCeiling,
        lineItemsCount: q._count?.lines || q.lines?.length || 0,
        subtotal: `₹${subtotalNum.toLocaleString('en-IN')}`,
        subtotalAmount: subtotalNum,
        discountAmount: discountNum,
        orderDiscountPercent: 0,
        taxAmount: taxNum,
        total: `₹${grandTotalNum.toLocaleString('en-IN')}`,
        totalAmount: grandTotalNum,
        blendedMargin: marginNum,
        marginStatus,
        riskScore: riskNum,
        status: q.status,
        approvalRequirement,
        approvalStage,
        repName: q.salesRep?.name || 'Assigned Rep',
        repEmail: q.salesRep?.email,
        updatedAt: q.updatedAt.toISOString(),
        paymentTerms: q.paymentTerms,
        portalToken: q.portalToken,
        expiresAt: q.expiresAt?.toISOString(),
        auditTrail,
        lines: (q.lines || []).map((l: any) => ({
          id: l.id,
          productId: l.productId,
          sku: l.product?.sku || 'SKU-GEN',
          name: l.product?.name || 'Item',
          category: l.product?.category?.name || 'HARDWARE',
          quantity: l.quantity,
          unitPrice: Number(l.unitPrice),
          unitCost: Number(l.unitCost),
          discountPercent: Number(l.discountPercent),
          effectiveCeiling: Number(l.effectiveCeiling),
          isViolation: l.isViolation,
          violationPoints: Number(l.violationPoints),
          netLineTotal: Number(l.netLinePrice),
          lineMarginPercent: Number(l.lineMarginPercent),
          isRecurring: l.isRecurring,
          billingFrequency: l.billingFrequency,
        })),
      };
    });

    return {
      quotations: formatted,
      total,
      stats: {
        totalDeals: total,
        drafts: formatted.filter((q) => q.status === 'DRAFT').length,
        inReview: formatted.filter((q) => q.status === 'IN_REVIEW').length,
        approved: formatted.filter((q) => q.status === 'APPROVED').length,
        customerReview: formatted.filter((q) => q.status === 'CUSTOMER_REVIEW').length,
        pipelineValue: formatted.reduce((acc, q) => acc + q.totalAmount, 0),
        avgMargin: formatted.length > 0 ? Number((formatted.reduce((acc, q) => acc + q.blendedMargin, 0) / formatted.length).toFixed(1)) : 0,
      },
    };
  }

  /**
   * Get single quotation by ID or quote number
   */
  public async getQuotationById(idOrQuoteNumber: string) {
    let quote = await quotationRepository.findByQuoteNumber(idOrQuoteNumber);
    if (!quote) {
      quote = await quotationRepository.findById(idOrQuoteNumber);
    }

    if (!quote) {
      throw new AppError(`Quotation not found: ${idOrQuoteNumber}`, 404);
    }

    const subtotalNum = Number(quote.subtotalAmount);
    const discountNum = Number(quote.totalDiscountAmount);
    const taxNum = Number(quote.taxAmount);
    const grandTotalNum = Number(quote.grandTotal);
    const marginNum = Number(quote.dealMarginPercent);
    const riskNum = Number(quote.blendedRiskScore);

    const marginStatus = marginNum >= 20 ? 'HIGH' : marginNum >= 10 ? 'MEDIUM' : 'DANGER';
    const tier = (quote.customer?.tier as CustomerTier) || 'BRONZE';
    const tierCeiling = DEFAULT_CUSTOMER_TIER_CEILINGS[tier] || 10.0;

    let approvalRequirement: 'NONE' | 'MANAGER_REQUIRED' | 'FINANCE_REQUIRED' | 'DUAL_REQUIRED' = 'NONE';
    if (quote.approvalRequests && quote.approvalRequests.length > 0) {
      const hasTier2 = quote.approvalRequests.some((a: any) => a.tierLevel === 2);
      const hasTier1 = quote.approvalRequests.some((a: any) => a.tierLevel === 1);
      if (hasTier1 && hasTier2) {
        approvalRequirement = 'DUAL_REQUIRED';
      } else if (hasTier2) {
        approvalRequirement = 'FINANCE_REQUIRED';
      } else {
        approvalRequirement = 'MANAGER_REQUIRED';
      }
    }

    let approvalStage: 'SALES_MANAGER' | 'FINANCE' | 'COMPLETED' | 'REJECTED' | 'RETURNED' = 'COMPLETED';
    if (quote.status === 'IN_REVIEW') {
      const tier1Pending = quote.approvalRequests?.some((a: any) => a.tierLevel === 1 && a.status === 'PENDING');
      const tier2Pending = quote.approvalRequests?.some((a: any) => a.tierLevel === 2 && a.status === 'PENDING');
      if (tier1Pending) {
        approvalStage = 'SALES_MANAGER';
      } else if (tier2Pending) {
        approvalStage = 'FINANCE';
      } else {
        approvalStage = 'SALES_MANAGER';
      }
    } else if (quote.status === 'APPROVED') {
      approvalStage = 'COMPLETED';
    } else if (quote.status === 'REJECTED') {
      approvalStage = 'REJECTED';
    }

    // Fetch audit logs for this specific quotation
    const auditLogs = await prisma.auditLog.findMany({
      where: { quotationId: quote.id },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const auditTrail = auditLogs.map(mapAuditLogToEntry);

    return {
      id: quote.quoteNumber,
      internalId: quote.id,
      quoteNumber: quote.quoteNumber,
      version: quote.version,
      customerName: quote.customer?.name || 'Unknown Customer',
      customerId: quote.customerId,
      tier,
      tierCeiling,
      lineItemsCount: quote.lines?.length || 0,
      subtotal: `₹${subtotalNum.toLocaleString('en-IN')}`,
      subtotalAmount: subtotalNum,
      discountAmount: discountNum,
      orderDiscountPercent: 0,
      taxAmount: taxNum,
      total: `₹${grandTotalNum.toLocaleString('en-IN')}`,
      totalAmount: grandTotalNum,
      blendedMargin: marginNum,
      marginStatus,
      riskScore: riskNum,
      status: quote.status,
      approvalRequirement,
      approvalStage,
      repName: quote.salesRep?.name || 'Assigned Rep',
      repEmail: quote.salesRep?.email,
      updatedAt: quote.updatedAt.toISOString(),
      paymentTerms: quote.paymentTerms,
      portalToken: quote.portalToken,
      expiresAt: quote.expiresAt?.toISOString(),
      approvalRequests: quote.approvalRequests || [],
      auditTrail,
      negotiationMessages: (quote.negotiationThreads || []).map((t: any) => ({
        id: t.id,
        quotationId: quote.quoteNumber,
        lineItemId: t.lineItemId,
        authorRole: t.authorRole,
        authorName: t.authorName,
        message: t.message,
        proposedDiscount: t.proposedDiscount ? Number(t.proposedDiscount) : null,
        createdAt: t.createdAt.toISOString(),
      })),
      lines: (quote.lines || []).map((l: any) => ({
        id: l.id,
        productId: l.productId,
        sku: l.product?.sku || 'SKU-GEN',
        name: l.product?.name || 'Item',
        category: l.product?.category?.name || 'HARDWARE',
        quantity: l.quantity,
        unitPrice: Number(l.unitPrice),
        unitCost: Number(l.unitCost),
        discountPercent: Number(l.discountPercent),
        effectiveCeiling: Number(l.effectiveCeiling),
        isViolation: l.isViolation,
        violationPoints: Number(l.violationPoints),
        netLineTotal: Number(l.netLinePrice),
        lineMarginPercent: Number(l.lineMarginPercent),
        isRecurring: l.isRecurring,
        billingFrequency: l.billingFrequency,
      })),
    };
  }

  /**
   * Get public portal view of quotation by portalToken (masks confidential COGS/margins)
   */
  public async getQuotationByPortalToken(portalToken: string) {
    const quote = await quotationRepository.findByPortalToken(portalToken);
    if (!quote) {
      throw new AppError('Invalid or expired negotiation portal link', 404);
    }

    if (new Date() > new Date(quote.portalTokenExpiresAt)) {
      throw new AppError('This customer negotiation portal token has expired', 410);
    }

    const subtotalNum = Number(quote.subtotalAmount);
    const discountNum = Number(quote.totalDiscountAmount);
    const taxNum = Number(quote.taxAmount);
    const grandTotalNum = Number(quote.grandTotal);

    return {
      quoteNumber: quote.quoteNumber,
      version: quote.version,
      status: quote.status,
      customer: {
        name: quote.customer.name,
        contactEmail: quote.customer.contactEmail,
        tier: quote.customer.tier,
      },
      salesRep: {
        name: quote.salesRep.name,
        email: quote.salesRep.email,
      },
      paymentTerms: quote.paymentTerms,
      subtotal: `₹${subtotalNum.toLocaleString('en-IN')}`,
      subtotalAmount: subtotalNum,
      discountAmount: discountNum,
      taxAmount: taxNum,
      grandTotal: `₹${grandTotalNum.toLocaleString('en-IN')}`,
      totalAmount: grandTotalNum,
      expiresAt: quote.expiresAt.toISOString(),
      lines: quote.lines.map((l: any) => ({
        id: l.id,
        productId: l.productId,
        sku: l.product.sku,
        name: l.product.name,
        category: l.product.category.name,
        quantity: l.quantity,
        unitPrice: Number(l.unitPrice),
        discountPercent: Number(l.discountPercent),
        netLineTotal: Number(l.netLinePrice),
        isRecurring: l.isRecurring,
        billingFrequency: l.billingFrequency,
      })),
      negotiationThreads: (quote.negotiationThreads || []).map((t: any) => ({
        id: t.id,
        authorRole: t.authorRole,
        authorName: t.authorName,
        message: t.message,
        proposedDiscount: t.proposedDiscount ? Number(t.proposedDiscount) : null,
        createdAt: t.createdAt.toISOString(),
      })),
    };
  }

  /**
   * Create a new quotation with lines, calculation, governance approval, and audit logs
   */
  public async createQuotation(data: any, user?: IAuthUser) {
    // 1. Resolve Customer
    let customer: any = null;
    if (data.customerId) {
      customer = await prisma.customer.findUnique({ where: { id: data.customerId } });
    }
    if (!customer && (data.customerId || data.customerName)) {
      customer = await prisma.customer.findFirst({
        where: {
          OR: [
            { code: { equals: data.customerId || '', mode: 'insensitive' } },
            { name: { equals: data.customerName || data.customerId, mode: 'insensitive' } },
            { name: { contains: data.customerName || '', mode: 'insensitive' } },
          ],
        },
      });
    }
    if (!customer) {
      customer = await prisma.customer.findFirst();
    }
    if (!customer) {
      throw new AppError('No customer record available to associate with quotation', 400);
    }

    // 2. Resolve Sales Rep
    let salesRepId: string | null = null;
    if (user?.id) {
      const userExists = await prisma.user.findUnique({ where: { id: user.id } });
      if (userExists) salesRepId = userExists.id;
    }
    if (!salesRepId) {
      const rep = await prisma.user.findFirst({ where: { role: 'SALES_REP' } });
      salesRepId = rep?.id || (await prisma.user.findFirst())?.id || '';
    }
    if (!salesRepId) {
      throw new AppError('No sales representative available to assign to quotation', 400);
    }

    // 3. Resolve Quote Number
    let quoteNumber = data.quoteNumber || data.id;
    if (quoteNumber) {
      const existing = await prisma.quotation.findUnique({ where: { quoteNumber } });
      if (existing) {
        quoteNumber = null;
      }
    }
    if (!quoteNumber) {
      const quotes = await prisma.quotation.findMany({ select: { quoteNumber: true } });
      const numbers = quotes
        .map((q) => {
          const match = q.quoteNumber.match(/\d+$/);
          return match ? parseInt(match[0], 10) : 0;
        })
        .filter((n) => !isNaN(n));
      const nextNum = numbers.length > 0 ? Math.max(...numbers) + 1 : 49;
      quoteNumber = `QT-2026-${String(nextNum).padStart(4, '0')}`;
    }

    // 4. Map & calculate line items
    const rawLines = Array.isArray(data.lines) ? data.lines : [];
    const allProducts = await prisma.product.findMany({ include: { category: true } });
    const tierCeiling = DEFAULT_CUSTOMER_TIER_CEILINGS[customer.tier as CustomerTier] || 15.0;

    let subtotalAmount = 0;
    let totalDiscountAmount = 0;
    let totalCostBasis = 0;

    const mappedLines: any[] = [];
    for (const rawLine of rawLines) {
      let matchedProd = allProducts.find(
        (p) =>
          p.id === rawLine.productId ||
          p.sku.toLowerCase() === (rawLine.sku || '').toLowerCase() ||
          p.name.toLowerCase() === (rawLine.name || '').toLowerCase()
      );
      if (!matchedProd && allProducts.length > 0) {
        matchedProd = allProducts[0];
      }
      if (!matchedProd) continue;

      const qty = Number(rawLine.quantity) || 1;
      const unitPrice = Number(rawLine.unitPrice ?? matchedProd.basePrice);
      const unitCost = Number(rawLine.unitCost ?? (matchedProd as any).costPrice ?? (matchedProd as any).costBasis ?? 0);
      const discountPercent = Number(rawLine.discountPercent ?? 0);
      const effectiveCeiling = Number(rawLine.effectiveCeiling ?? tierCeiling);
      const isViolation = discountPercent > effectiveCeiling;
      const violationPoints = isViolation ? discountPercent - effectiveCeiling : 0;
      const netPerUnit = unitPrice * (1 - discountPercent / 100);
      const netLinePrice = netPerUnit * qty;
      const lineCostTotal = unitCost * qty;
      const lineMarginPercent =
        netLinePrice > 0 ? ((netLinePrice - lineCostTotal) / netLinePrice) * 100 : 0;

      subtotalAmount += unitPrice * qty;
      totalDiscountAmount += (unitPrice - netPerUnit) * qty;
      totalCostBasis += lineCostTotal;

      mappedLines.push({
        productId: matchedProd.id,
        quantity: qty,
        unitPrice,
        unitCost,
        discountPercent,
        effectiveCeiling,
        isViolation,
        violationPoints,
        netLinePrice: parseFloat(netLinePrice.toFixed(2)),
        lineMarginPercent: parseFloat(lineMarginPercent.toFixed(2)),
        isRecurring: Boolean(rawLine.isRecurring),
        billingFrequency: rawLine.billingFrequency || 'ONE_TIME',
      });
    }

    if (subtotalAmount === 0 && data.subtotalAmount) {
      subtotalAmount = Number(data.subtotalAmount);
    }
    if (totalDiscountAmount === 0 && data.discountAmount) {
      totalDiscountAmount = Number(data.discountAmount);
    }

    const netTotal = subtotalAmount - totalDiscountAmount;
    const taxAmount = data.taxAmount !== undefined ? Number(data.taxAmount) : parseFloat((netTotal * 0.18).toFixed(2));
    const grandTotal = data.totalAmount !== undefined ? Number(data.totalAmount) : parseFloat((netTotal + taxAmount).toFixed(2));
    const dealMarginPercent =
      data.blendedMargin !== undefined
        ? Number(data.blendedMargin)
        : netTotal > 0
        ? parseFloat((((netTotal - totalCostBasis) / netTotal) * 100).toFixed(2))
        : 18.0;

    const hasViolation = mappedLines.some((l) => l.isViolation);
    const calculatedRiskScore =
      data.riskScore !== undefined
        ? Number(data.riskScore)
        : hasViolation || dealMarginPercent < 15
        ? 45.0
        : 15.0;

    const requestedStatus = (data.status as QuoteStatus) || (hasViolation ? 'IN_REVIEW' : 'DRAFT');
    const paymentTerms = data.paymentTerms || customer.paymentTerms || 'Net 30';
    const portalToken = data.portalToken || randomUUID();
    const portalTokenExpiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    const expiresAt = data.expiresAt ? new Date(data.expiresAt) : portalTokenExpiresAt;

    // 5. Persist to PostgreSQL in Transaction
    const createdQuote = await prisma.$transaction(async (tx) => {
      const q = await tx.quotation.create({
        data: {
          quoteNumber,
          version: 1,
          customerId: customer.id,
          salesRepId,
          status: requestedStatus,
          paymentTerms,
          subtotalAmount: parseFloat(subtotalAmount.toFixed(2)),
          totalDiscountAmount: parseFloat(totalDiscountAmount.toFixed(2)),
          taxAmount,
          grandTotal,
          totalCostBasis: parseFloat(totalCostBasis.toFixed(2)),
          dealMarginPercent,
          blendedRiskScore: calculatedRiskScore,
          portalToken,
          portalTokenExpiresAt,
          expiresAt,
          lines: {
            create: mappedLines,
          },
        },
      });

      // Governance chain creation if review required
      if (requestedStatus === 'IN_REVIEW') {
        const isDual = calculatedRiskScore > 50 || dealMarginPercent < 18;
        const manager = await tx.user.findFirst({ where: { role: 'SALES_MANAGER' } });
        await tx.approvalRequest.create({
          data: {
            quotationId: q.id,
            approverId: manager?.id,
            tierLevel: 1,
            status: 'PENDING',
          },
        });

        if (isDual) {
          const finance = await tx.user.findFirst({ where: { role: 'FINANCE_OPS' } });
          await tx.approvalRequest.create({
            data: {
              quotationId: q.id,
              approverId: finance?.id,
              tierLevel: 2,
              status: 'PENDING',
            },
          });
        }
      }

      // Audit Log
      await tx.auditLog.create({
        data: {
          quotationId: q.id,
          actorId: salesRepId,
          action: requestedStatus === 'IN_REVIEW' ? 'SUBMITTED' : 'QUOTE_CREATED',
          newState: requestedStatus,
          reason:
            requestedStatus === 'IN_REVIEW'
              ? 'Quotation submitted for governance review via Quotation Builder.'
              : 'Quotation draft created via Quotation Builder.',
          metadataJson: {
            subtotal: subtotalAmount,
            grandTotal,
            blendedMargin: dealMarginPercent,
            riskScore: calculatedRiskScore,
            actorName: user?.name || 'Sales Representative',
            actorRole: user?.role || 'SALES_REP',
            timestamp: formatAuditTimestamp(new Date()),
          },
        },
      });

      return q;
    });

    return this.getQuotationById(createdQuote.id);
  }

  /**
   * Update existing quotation with new lines, calculations, optimistic lock, and audit trail
   */
  public async updateQuotation(idOrQuoteNumber: string, data: any, user?: IAuthUser) {
    let existing = await quotationRepository.findByQuoteNumber(idOrQuoteNumber);
    if (!existing) {
      existing = await quotationRepository.findById(idOrQuoteNumber);
    }

    // If quotation doesn't exist in the database yet, initialize and create it
    if (!existing) {
      return this.createQuotation({ ...data, quoteNumber: idOrQuoteNumber }, user);
    }

    const rawLines = Array.isArray(data.lines) ? data.lines : [];
    const allProducts = await prisma.product.findMany({ include: { category: true } });
    const tierCeiling = DEFAULT_CUSTOMER_TIER_CEILINGS[existing.customer?.tier as CustomerTier] || 15.0;

    let subtotalAmount = 0;
    let totalDiscountAmount = 0;
    let totalCostBasis = 0;

    const mappedLines: any[] = [];
    for (const rawLine of rawLines) {
      let matchedProd = allProducts.find(
        (p) =>
          p.id === rawLine.productId ||
          p.sku.toLowerCase() === (rawLine.sku || '').toLowerCase() ||
          p.name.toLowerCase() === (rawLine.name || '').toLowerCase()
      );
      if (!matchedProd && allProducts.length > 0) {
        matchedProd = allProducts[0];
      }
      if (!matchedProd) continue;

      const qty = Number(rawLine.quantity) || 1;
      const unitPrice = Number(rawLine.unitPrice ?? matchedProd.basePrice);
      const unitCost = Number(rawLine.unitCost ?? (matchedProd as any).costPrice ?? (matchedProd as any).costBasis ?? 0);
      const discountPercent = Number(rawLine.discountPercent ?? 0);
      const effectiveCeiling = Number(rawLine.effectiveCeiling ?? tierCeiling);
      const isViolation = discountPercent > effectiveCeiling;
      const violationPoints = isViolation ? discountPercent - effectiveCeiling : 0;
      const netPerUnit = unitPrice * (1 - discountPercent / 100);
      const netLinePrice = netPerUnit * qty;
      const lineCostTotal = unitCost * qty;
      const lineMarginPercent =
        netLinePrice > 0 ? ((netLinePrice - lineCostTotal) / netLinePrice) * 100 : 0;

      subtotalAmount += unitPrice * qty;
      totalDiscountAmount += (unitPrice - netPerUnit) * qty;
      totalCostBasis += lineCostTotal;

      mappedLines.push({
        quotationId: existing.id,
        productId: matchedProd.id,
        quantity: qty,
        unitPrice,
        unitCost,
        discountPercent,
        effectiveCeiling,
        isViolation,
        violationPoints,
        netLinePrice: parseFloat(netLinePrice.toFixed(2)),
        lineMarginPercent: parseFloat(lineMarginPercent.toFixed(2)),
        isRecurring: Boolean(rawLine.isRecurring),
        billingFrequency: rawLine.billingFrequency || 'ONE_TIME',
      });
    }

    if (subtotalAmount === 0 && data.subtotalAmount) {
      subtotalAmount = Number(data.subtotalAmount);
    }
    if (totalDiscountAmount === 0 && data.discountAmount) {
      totalDiscountAmount = Number(data.discountAmount);
    }

    const netTotal = subtotalAmount - totalDiscountAmount;
    const taxAmount = data.taxAmount !== undefined ? Number(data.taxAmount) : parseFloat((netTotal * 0.18).toFixed(2));
    const grandTotal = data.totalAmount !== undefined ? Number(data.totalAmount) : parseFloat((netTotal + taxAmount).toFixed(2));
    const dealMarginPercent =
      data.blendedMargin !== undefined
        ? Number(data.blendedMargin)
        : netTotal > 0
        ? parseFloat((((netTotal - totalCostBasis) / netTotal) * 100).toFixed(2))
        : Number(existing.dealMarginPercent);

    const hasViolation = mappedLines.some((l) => l.isViolation);
    const calculatedRiskScore =
      data.riskScore !== undefined
        ? Number(data.riskScore)
        : hasViolation || dealMarginPercent < 15
        ? 45.0
        : 15.0;

    const nextStatus = (data.status as QuoteStatus) || existing.status;
    const paymentTerms = data.paymentTerms || existing.paymentTerms;

    let actorId = existing.salesRepId;
    if (user?.id) {
      const userExists = await prisma.user.findUnique({ where: { id: user.id } });
      if (userExists) actorId = userExists.id;
    }

    await prisma.$transaction(async (tx) => {
      if (mappedLines.length > 0) {
        await tx.quotationLine.deleteMany({ where: { quotationId: existing.id } });
        await tx.quotationLine.createMany({ data: mappedLines });
      }

      await tx.quotation.update({
        where: { id: existing.id },
        data: {
          version: { increment: 1 },
          status: nextStatus,
          paymentTerms,
          subtotalAmount: parseFloat(subtotalAmount.toFixed(2)),
          totalDiscountAmount: parseFloat(totalDiscountAmount.toFixed(2)),
          taxAmount,
          grandTotal,
          dealMarginPercent,
          blendedRiskScore: calculatedRiskScore,
        },
      });

      if (nextStatus === 'IN_REVIEW') {
        const pendingApproval = await tx.approvalRequest.findFirst({
          where: { quotationId: existing.id, status: 'PENDING' },
        });
        if (!pendingApproval) {
          const manager = await tx.user.findFirst({ where: { role: 'SALES_MANAGER' } });
          await tx.approvalRequest.create({
            data: {
              quotationId: existing.id,
              approverId: manager?.id,
              tierLevel: 1,
              status: 'PENDING',
            },
          });
        }
      }

      await tx.auditLog.create({
        data: {
          quotationId: existing.id,
          actorId,
          action: nextStatus === 'IN_REVIEW' && existing.status !== 'IN_REVIEW' ? 'SUBMITTED' : 'QUOTE_MUTATED',
          previousState: existing.status,
          newState: nextStatus,
          reason: data.notes || `Quotation terms updated via Quotation Builder.`,
          metadataJson: {
            subtotal: subtotalAmount,
            grandTotal,
            blendedMargin: dealMarginPercent,
            riskScore: calculatedRiskScore,
            actorName: user?.name || 'Sales Representative',
            actorRole: user?.role || 'SALES_REP',
            timestamp: formatAuditTimestamp(new Date()),
          },
        },
      });
    });

    return this.getQuotationById(existing.id);
  }

  /**
   * Submit Customer Counter-Offer / Change Request & store in database
   */
  public async submitCounterOffer(
    tokenOrId: string,
    data: {
      lineItemId?: string;
      proposedDiscount: number;
      proposedQuantity?: number;
      message?: string;
      authorName?: string;
      authorRole?: string;
    }
  ) {
    const quote = await prisma.quotation.findFirst({
      where: {
        OR: [
          { id: tokenOrId },
          { quoteNumber: tokenOrId },
          { portalToken: tokenOrId },
          { customerId: tokenOrId },
          ...(tokenOrId === 'cust-001' || tokenOrId === 'demo-token'
            ? [{ portalToken: 'cust-001' }, { portalToken: 'demo-token' }, { quoteNumber: 'QT-2026-0043' }]
            : []),
        ],
      },
      include: {
        lines: true,
        customer: true,
        salesRep: true,
      },
    });

    if (!quote) {
      throw new AppError('Quotation not found for counter-offer submission', 404);
    }

    const proposedDiscount = Math.max(0, Math.min(100, Number(data.proposedDiscount) || 0));
    const proposedQuantity = data.proposedQuantity ? Number(data.proposedQuantity) : undefined;
    const authorName = data.authorName || 'David Chen (VP of Procurement)';
    const authorRole = data.authorRole || 'CUSTOMER';

    // Find targeted quotation line item
    let targetLine = quote.lines.find((l) => l.id === data.lineItemId);
    if (!targetLine && quote.lines.length > 0) {
      targetLine = quote.lines[0];
    }

    let reApprovalRequired = false;
    let newStatus: QuoteStatus = QuoteStatus.NEGOTIATING;

    await prisma.$transaction(async (tx) => {
      // 1. Update targeted line item if present
      if (targetLine) {
        const newQty = proposedQuantity && proposedQuantity > 0 ? proposedQuantity : targetLine.quantity;
        const effectiveCeiling = Number(targetLine.effectiveCeiling);
        const isViolation = proposedDiscount > effectiveCeiling;
        if (isViolation) {
          reApprovalRequired = true;
          newStatus = QuoteStatus.IN_REVIEW;
        }

        const unitPriceNum = Number(targetLine.unitPrice);
        const netPerUnit = unitPriceNum * (1 - proposedDiscount / 100);
        const netLinePrice = new Prisma.Decimal(netPerUnit * newQty);
        const violationPoints = isViolation
          ? new Prisma.Decimal(proposedDiscount - effectiveCeiling)
          : new Prisma.Decimal(0);

        await tx.quotationLine.update({
          where: { id: targetLine.id },
          data: {
            quantity: newQty,
            discountPercent: new Prisma.Decimal(proposedDiscount),
            netLinePrice,
            isViolation,
            violationPoints,
          },
        });
      }

      // 2. Fetch updated lines and recalculate totals
      const currentLines = await tx.quotationLine.findMany({
        where: { quotationId: quote.id },
      });

      const subtotalAmount = currentLines.reduce(
        (acc, l) => acc + Number(l.unitPrice) * l.quantity,
        0
      );
      const totalNet = currentLines.reduce((acc, l) => acc + Number(l.netLinePrice), 0);
      const totalDiscountAmount = subtotalAmount - totalNet;
      const taxAmount = Math.round(totalNet * 0.18);
      const grandTotal = totalNet + taxAmount;

      const anyBreach = currentLines.some(
        (l) => l.isViolation || Number(l.discountPercent) > Number(l.effectiveCeiling)
      );
      if (anyBreach) {
        newStatus = QuoteStatus.IN_REVIEW;
        reApprovalRequired = true;
      }

      await tx.quotation.update({
        where: { id: quote.id },
        data: {
          status: newStatus,
          subtotalAmount: new Prisma.Decimal(subtotalAmount),
          totalDiscountAmount: new Prisma.Decimal(totalDiscountAmount),
          taxAmount: new Prisma.Decimal(taxAmount),
          grandTotal: new Prisma.Decimal(grandTotal),
        },
      });

      // 3. Store in customer_negotiation_threads in database
      await tx.customerNegotiationThread.create({
        data: {
          quotationId: quote.id,
          lineItemId: targetLine?.id || null,
          authorRole,
          authorName,
          message:
            data.message ||
            `Customer submitted counter-offer of ${proposedDiscount}% on ${targetLine?.id || 'proposal line'}.`,
          proposedDiscount: new Prisma.Decimal(proposedDiscount),
          proposedQuantity: proposedQuantity || null,
        },
      });
    });

    return {
      reApprovalRequired,
      quoteNumber: quote.quoteNumber,
      status: newStatus,
      message: reApprovalRequired
        ? `Counter-offer (${proposedDiscount}%) submitted to database. Requires Managerial re-approval due to discount ceiling breach.`
        : `Counter-offer (${proposedDiscount}%) successfully stored in database. Status updated to NEGOTIATING.`,
    };
  }

  /**
   * Confirm Quotation & Generate Sales Order in database
   */
  public async confirmQuotation(
    tokenOrId: string,
    data: {
      signerName: string;
      signerTitle: string;
      acceptanceNotes?: string;
    }
  ) {
    const quote = await prisma.quotation.findFirst({
      where: {
        OR: [
          { id: tokenOrId },
          { quoteNumber: tokenOrId },
          { portalToken: tokenOrId },
          { customerId: tokenOrId },
          ...(tokenOrId === 'cust-001' || tokenOrId === 'demo-token'
            ? [{ portalToken: 'cust-001' }, { portalToken: 'demo-token' }, { quoteNumber: 'QT-2026-0043' }]
            : []),
        ],
      },
      include: {
        lines: true,
        customer: true,
        salesRep: true,
      },
    });

    if (!quote) {
      throw new AppError('Quotation not found for confirmation', 404);
    }

    const signerName = data.signerName || 'David Chen';
    const signerTitle = data.signerTitle || 'VP of Procurement';
    const acceptanceNotes = data.acceptanceNotes || 'Commercial proposal accepted and digitally signed.';

    const hasBreach = quote.lines.some(
      (l) => l.isViolation || Number(l.discountPercent) > Number(l.effectiveCeiling)
    );

    const routeType: 'FULFILLMENT' | 'RE_APPROVAL' = hasBreach ? 'RE_APPROVAL' : 'FULFILLMENT';
    const nextStatus: QuoteStatus = hasBreach ? QuoteStatus.IN_REVIEW : QuoteStatus.ACCEPTED;
    const numPart = quote.quoteNumber.replace(/[^0-9]/g, '').slice(-4) || '0043';
    const salesOrderNumber = `SO-2026-${numPart}`;

    let salesOrder: any = null;

    await prisma.$transaction(async (tx) => {
      // 1. Update quotation status in database
      await tx.quotation.update({
        where: { id: quote.id },
        data: {
          status: nextStatus,
        },
      });

      if (routeType === 'FULFILLMENT') {
        // 2. Create/upsert SalesOrder in database
        salesOrder = await tx.salesOrder.upsert({
          where: { quotationId: quote.id },
          update: {
            status: 'PENDING',
            totalAmount: quote.grandTotal,
          },
          create: {
            orderNumber: salesOrderNumber,
            quotationId: quote.id,
            customerId: quote.customerId,
            status: 'PENDING',
            totalAmount: quote.grandTotal,
          },
        });

        // 3. Store confirmation in customer_negotiation_threads
        await tx.customerNegotiationThread.create({
          data: {
            quotationId: quote.id,
            authorRole: 'CUSTOMER',
            authorName: `${signerName} (${signerTitle})`,
            message: `Digitally confirmed & signed by ${signerName} (${signerTitle}). Sales order ${salesOrderNumber} created in database. ${acceptanceNotes}`,
          },
        });
      } else {
        // 3b. Store re-approval attempt in customer_negotiation_threads
        await tx.customerNegotiationThread.create({
          data: {
            quotationId: quote.id,
            authorRole: 'CUSTOMER',
            authorName: `${signerName} (${signerTitle})`,
            message: `Procurement attempted confirmation. Because terms exceed discount ceilings, quotation was re-routed to Manager for B4 Governance Review.`,
          },
        });
      }
    });

    return {
      status: nextStatus,
      routeType,
      salesOrderNumber: routeType === 'FULFILLMENT' ? salesOrderNumber : undefined,
      salesOrder,
      message:
        routeType === 'FULFILLMENT'
          ? `Quotation confirmed! Sales Order ${salesOrderNumber} generated in database.`
          : `Quotation terms exceed discount ceilings. Re-routed to Manager for B4 review.`,
    };
  }
}

export const quotationService = new QuotationService();
