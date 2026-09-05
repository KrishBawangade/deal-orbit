import { CustomerTier, ProductCategory } from '@prisma/client';
import { categoryRepository } from '../repositories/category.repository';
import { discountCeilingRepository } from '../repositories/discountCeiling.repository';
import { approvalChainRepository } from '../repositories/approvalChain.repository';
import { auditLogRepository } from '../repositories/auditLog.repository';
import {
  IDiscountCeilingsResponse,
  IApprovalChainRule,
  IUpdateDiscountCeilingDto,
  IUpdateApprovalChainDto,
} from '../types';
import { AppError } from '../utils/appError';

export const DEFAULT_CUSTOMER_TIER_CEILINGS: Record<CustomerTier, number> = {
  BRONZE: 5.0,
  SILVER: 10.0,
  GOLD: 15.0,
  ENTERPRISE: 20.0,
};

export const DEFAULT_CATEGORY_CEILINGS: Record<ProductCategory, number> = {
  HARDWARE: 15.0,
  SOFTWARE: 20.0,
  SERVICES: 10.0,
};

export interface IEvaluateLineInput {
  productId?: string;
  categoryId?: string;
  categoryName?: ProductCategory | string;
  proposedDiscount: number;
  customerTier: CustomerTier;
}

export interface ILineBreachEvaluation {
  effectiveCeiling: number;
  isViolation: boolean;
  violationPoints: number;
  customerTierCeiling: number;
  categoryCeiling: number;
  categoryName: string;
}

export interface ILineRiskItem {
  netAmount: number;
  discountPercent: number;
  effectiveCeiling: number;
}

export interface ICalculateBlendedRiskInput {
  lines: ILineRiskItem[];
  totalAmount: number;
  dealMarginPercent: number;
  repHistoricalAvgDiscount?: number;
}

export interface IDetermineApprovalRoutingInput {
  riskScore: number;
  lineEvaluations: Array<{
    isViolation: boolean;
    violationPoints: number;
    categoryName?: string;
    productName?: string;
  }>;
  dealMarginPercent: number;
}

export interface IApprovalRoutingResult {
  tierLevel: number; // 0 = Auto-Approved, 1 = Sales Manager, 2 = Sales Manager + Finance
  requiresManager: boolean;
  requiresFinance: boolean;
  assignedRole: 'SALES_MANAGER' | 'FINANCE_OPS' | null;
  status: 'APPROVED' | 'IN_REVIEW';
  reasons: string[];
}

export interface ILogAuditParams {
  quotationId?: string | null;
  salesOrderId?: string | null;
  actorId?: string | null;
  action: string;
  previousState?: string | null;
  newState?: string | null;
  reason: string;
  metadata?: Record<string, unknown>;
}

export class GovernanceService {
  /**
   * Calculates effective ceiling for a line item given the customer tier and product category.
   * Rule: Category ceiling strictly overrides customer tier ceiling:
   * Effective Ceiling = min(CustomerTierCeiling, CategoryCeiling)
   * (or database-configured DiscountCeiling override if present)
   */
  public async getEffectiveCeiling(
    customerTier: CustomerTier,
    categoryIdOrName: string
  ): Promise<{
    effectiveCeiling: number;
    customerTierCeiling: number;
    categoryCeiling: number;
    categoryName: string;
  }> {
    const customerTierCeiling = DEFAULT_CUSTOMER_TIER_CEILINGS[customerTier] ?? 5.0;

    let category = null;
    let explicitCeiling = null;

    try {
      // 1. Resolve Category
      category = await categoryRepository.findById(categoryIdOrName);
      if (!category && Object.values(ProductCategory).includes(categoryIdOrName as ProductCategory)) {
        category = await categoryRepository.findByName(categoryIdOrName as ProductCategory);
      }

      // 2. Check for explicit override in discount_ceilings table
      if (category) {
        explicitCeiling = await discountCeilingRepository.findByTierAndCategory(
          customerTier,
          category.id
        );
      }
    } catch {
      // If database is offline or uninitialized, proceed with standard category defaults
    }

    const categoryName = category?.name ?? (categoryIdOrName as ProductCategory) ?? 'HARDWARE';
    const categoryCeiling = category
      ? Number(category.defaultCeilingDiscount)
      : (DEFAULT_CATEGORY_CEILINGS[categoryName as ProductCategory] ?? 10.0);

    if (explicitCeiling) {
      const ceilingVal = Number(explicitCeiling.maxDiscountPercent);
      return {
        effectiveCeiling: ceilingVal,
        customerTierCeiling,
        categoryCeiling,
        categoryName,
      };
    }

    // 3. Standard rule: min(CustomerTierCeiling, CategoryCeiling)
    const effectiveCeiling = Math.min(customerTierCeiling, categoryCeiling);

    return {
      effectiveCeiling,
      customerTierCeiling,
      categoryCeiling,
      categoryName,
    };
  }

  /**
   * Evaluates whether a proposed line discount breaches governance ceilings.
   */
  public async evaluateLineDiscount(
    input: IEvaluateLineInput
  ): Promise<ILineBreachEvaluation> {
    const categoryRef = input.categoryId || input.categoryName || 'HARDWARE';
    const { effectiveCeiling, customerTierCeiling, categoryCeiling, categoryName } =
      await this.getEffectiveCeiling(input.customerTier, categoryRef);

    const isViolation = input.proposedDiscount > effectiveCeiling;
    const violationPoints = isViolation
      ? Number((input.proposedDiscount - effectiveCeiling).toFixed(2))
      : 0.0;

    return {
      effectiveCeiling,
      isViolation,
      violationPoints,
      customerTierCeiling,
      categoryCeiling,
      categoryName,
    };
  }

  /**
   * Computes the Blended Risk Score across mixed categories:
   * Risk Score = 4.0 * sum( (lineAmount / totalAmount) * max(0, discount - ceiling) )
   *            + 25.0 * max(0, 0.20 - dealMarginFraction)
   *            + 1.0 * max(0, proposedAvgDiscount - repHistoricalAvgDiscount)
   * Clamped to [0.00, 100.00]
   */
  public calculateBlendedRiskScore(input: ICalculateBlendedRiskInput): number {
    const { lines, totalAmount, dealMarginPercent, repHistoricalAvgDiscount = 0 } = input;

    if (!lines || lines.length === 0) {
      return 0.0;
    }

    // 1. Discount Leakage Component (weight-averaged overage across categories)
    let weightedOverage = 0.0;
    let totalDiscountSum = 0.0;

    for (const line of lines) {
      const weight = totalAmount > 0 ? line.netAmount / totalAmount : 1 / lines.length;
      const overage = Math.max(0, line.discountPercent - line.effectiveCeiling);
      weightedOverage += weight * overage;
      totalDiscountSum += line.discountPercent;
    }

    const discountLeakageScore = 4.0 * weightedOverage;

    // 2. Margin Erosion Component
    // Target minimum gross margin is 20.0%. For each 1% below 20%, adds 0.25 to score (25.0 * fraction)
    const dealMarginFraction = dealMarginPercent / 100.0;
    const marginPenalty = 25.0 * Math.max(0, 0.2 - dealMarginFraction);

    // 3. Rep Volatility Component
    const proposedAvgDiscount = totalDiscountSum / lines.length;
    const repVolatility = Math.max(0, proposedAvgDiscount - repHistoricalAvgDiscount);
    const volatilityScore = 1.0 * repVolatility;

    // Aggregate and clamp to [0, 100]
    const rawScore = discountLeakageScore + marginPenalty + volatilityScore;
    const blendedScore = Math.min(100.0, Math.max(0.0, rawScore));

    return Number(blendedScore.toFixed(2));
  }

  /**
   * Routes the quotation to the highest required approval level:
   * When a quote mixes categories with different ceilings, the system evaluates:
   * - Individual line violation points
   * - Aggregate deal margin erosion
   * - Blended risk score
   * And routes to max(Line Tiers, Margin Tier, Risk Score Tier).
   */
  public determineApprovalRouting(
    input: IDetermineApprovalRoutingInput
  ): IApprovalRoutingResult {
    const { riskScore, lineEvaluations, dealMarginPercent } = input;
    const reasons: string[] = [];

    let highestTier = 0;

    // 1. Check individual line violations
    for (const line of lineEvaluations) {
      if (line.isViolation) {
        if (line.violationPoints > 5.0) {
          highestTier = Math.max(highestTier, 2);
          reasons.push(
            `Line item (${line.categoryName || 'Item'}) discount breaches ceiling by ${line.violationPoints.toFixed(
              2
            )}% (> 5.0% ceiling overage requires Finance approval).`
          );
        } else if (line.violationPoints > 0) {
          highestTier = Math.max(highestTier, 1);
          reasons.push(
            `Line item (${line.categoryName || 'Item'}) discount breaches ceiling by ${line.violationPoints.toFixed(
              2
            )}% (requires Sales Manager review).`
          );
        }
      }
    }

    // 2. Check deal gross margin
    if (dealMarginPercent < 15.0) {
      highestTier = Math.max(highestTier, 2);
      reasons.push(
        `Blended deal margin of ${dealMarginPercent.toFixed(
          2
        )}% is below 15.0% floor (requires Finance sign-off).`
      );
    } else if (dealMarginPercent < 18.0) {
      highestTier = Math.max(highestTier, 1);
      reasons.push(
        `Blended deal margin of ${dealMarginPercent.toFixed(
          2
        )}% is below standard target 18.0% (requires Sales Manager review).`
      );
    }

    // 3. Check blended risk score
    if (riskScore > 50.0) {
      highestTier = Math.max(highestTier, 2);
      reasons.push(
        `Blended Risk Score is ${riskScore.toFixed(
          2
        )} (exceeds high-risk threshold of 50.00, requiring Manager + Finance sign-off).`
      );
    } else if (riskScore > 20.0) {
      highestTier = Math.max(highestTier, 1);
      reasons.push(
        `Blended Risk Score is ${riskScore.toFixed(
          2
        )} (exceeds standard threshold of 20.00, requiring Sales Manager review).`
      );
    }

    // Determine final routing
    const requiresManager = highestTier >= 1;
    const requiresFinance = highestTier >= 2;
    const assignedRole =
      highestTier === 2 ? 'FINANCE_OPS' : highestTier === 1 ? 'SALES_MANAGER' : null;
    const status = highestTier === 0 ? 'APPROVED' : 'IN_REVIEW';

    if (highestTier === 0) {
      reasons.push('Quotation complies with all customer tier and category discount ceilings.');
    }

    return {
      tierLevel: highestTier,
      requiresManager,
      requiresFinance,
      assignedRole,
      status,
      reasons,
    };
  }

  /**
   * Logs an immutable audit event for any quote edit, approval, rejection, or counter-offer.
   */
  public async logAuditEvent(params: ILogAuditParams): Promise<void> {
    if (!params.reason || params.reason.trim() === '') {
      throw new AppError('Audit log requires a mandatory reason.', 400);
    }

    await auditLogRepository.create({
      quotationId: params.quotationId,
      salesOrderId: params.salesOrderId,
      actorId: params.actorId,
      action: params.action,
      previousState: params.previousState,
      newState: params.newState,
      reason: params.reason,
      metadataJson: params.metadata as any,
    });
  }

  /**
   * Fetches the discount ceilings matrix (Customer Tiers + Category Overrides).
   */
  public async getDiscountCeilingsMatrix(): Promise<IDiscountCeilingsResponse> {
    const categories = await categoryRepository.findAll();

    const customerTiers = (Object.keys(DEFAULT_CUSTOMER_TIER_CEILINGS) as CustomerTier[]).map(
      (tier) => ({
        tier,
        defaultCeiling: DEFAULT_CUSTOMER_TIER_CEILINGS[tier],
      })
    );

    const categoryOverrides = (Object.keys(DEFAULT_CATEGORY_CEILINGS) as ProductCategory[]).map(
      (category) => {
        const catRecord = categories.find((c) => c.name === category);
        return {
          category,
          maxDiscount: catRecord
            ? Number(catRecord.defaultCeilingDiscount)
            : DEFAULT_CATEGORY_CEILINGS[category],
        };
      }
    );

    return {
      customerTiers,
      categoryOverrides,
    };
  }

  /**
   * Updates or inserts a discount ceiling override for a specific customer tier and category.
   */
  public async updateDiscountCeiling(dto: IUpdateDiscountCeilingDto): Promise<void> {
    let category = await categoryRepository.findById(dto.categoryId);
    if (!category) {
      category = await categoryRepository.findByName(dto.categoryId as ProductCategory);
    }

    if (!category) {
      throw new AppError(`Category not found with ID or name: ${dto.categoryId}`, 404);
    }

    await discountCeilingRepository.upsertCeiling(
      dto.customerTier,
      category.id,
      dto.maxDiscountPercent
    );
  }

  /**
   * Retrieves configured approval chain rules.
   */
  public async getApprovalChainRules(): Promise<IApprovalChainRule[]> {
    const rules = await approvalChainRepository.findAll();

    return rules.map((r) => ({
      id: r.id,
      minRiskScore: Number(r.minRiskScore),
      maxRiskScore: Number(r.maxRiskScore),
      requiresManager: r.requiresManager,
      requiresFinance: r.requiresFinance,
      description: r.description,
    }));
  }

  /**
   * Updates or creates an approval chain threshold rule.
   */
  public async updateApprovalChainRule(
    dto: IUpdateApprovalChainDto
  ): Promise<IApprovalChainRule> {
    const rule = await approvalChainRepository.upsertRule({
      id: dto.id,
      minRiskScore: dto.minRiskScore,
      maxRiskScore: dto.maxRiskScore,
      requiresManager: dto.requiresManager,
      requiresFinance: dto.requiresFinance,
      description: dto.description,
    });

    return {
      id: rule.id,
      minRiskScore: Number(rule.minRiskScore),
      maxRiskScore: Number(rule.maxRiskScore),
      requiresManager: rule.requiresManager,
      requiresFinance: rule.requiresFinance,
      description: rule.description,
    };
  }
}

export const governanceService = new GovernanceService();
