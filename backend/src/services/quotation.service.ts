import { Prisma, QuoteStatus, CustomerTier } from '@prisma/client';
import { quotationRepository, IQuotationFilter } from '../repositories/quotation.repository';
import { prisma } from '../config/database';
import { governanceService, DEFAULT_CUSTOMER_TIER_CEILINGS } from './governance.service';
import { AppError } from '../utils/appError';
import { IAuthUser } from '../types';

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

      const tier = (q.customer?.tier as CustomerTier) || 'BRONZE';
      const tierCeiling = DEFAULT_CUSTOMER_TIER_CEILINGS[tier] || 10.0;

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
        repName: q.salesRep?.name || 'Assigned Rep',
        repEmail: q.salesRep?.email,
        updatedAt: q.updatedAt.toISOString(),
        paymentTerms: q.paymentTerms,
        portalToken: q.portalToken,
        expiresAt: q.expiresAt?.toISOString(),
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
      repName: quote.salesRep?.name || 'Assigned Rep',
      repEmail: quote.salesRep?.email,
      updatedAt: quote.updatedAt.toISOString(),
      paymentTerms: quote.paymentTerms,
      portalToken: quote.portalToken,
      expiresAt: quote.expiresAt?.toISOString(),
      approvalRequests: quote.approvalRequests || [],
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
}

export const quotationService = new QuotationService();
