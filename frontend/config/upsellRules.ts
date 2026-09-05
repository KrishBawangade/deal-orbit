import { CATALOG_PRODUCTS, ICatalogProduct } from "./catalogData";
import { QuotationLineItem } from "@/context/QuotationsContext";

export interface IUpsellRuleConfig {
  id: string;
  sourceProductId?: string; // If undefined, applies as a general catalog promotion
  targetProductId: string;
  affinityScore: number;
  promotionalTag?: "PROMOTED" | "POPULAR PAIRING" | "BUNDLE DEAL" | "MARGIN BOOSTER" | null;
  rationale: string;
}

export interface IRankedRecommendation {
  ruleId: string;
  product: ICatalogProduct;
  affinityScore: number;
  promotionalTag: "PROMOTED" | "POPULAR PAIRING" | "BUNDLE DEAL" | "MARGIN BOOSTER" | null;
  rationale: string;
  marginDeltaPercent: number; // e.g. +2.4 or -0.8
  potentialBlendedMargin: number;
  isMarginBooster: boolean;
}

export const UPSELL_RULES: IUpsellRuleConfig[] = [
  // Laptops (prod-hw-01)
  {
    id: "rule-lap-care",
    sourceProductId: "prod-hw-01",
    targetProductId: "prod-srv-02", // 2-Year Care Pack
    affinityScore: 96,
    promotionalTag: "POPULAR PAIRING",
    rationale: "92% of enterprise workstation buyers bundle 2-year next-day onsite care.",
  },
  {
    id: "rule-lap-dock",
    sourceProductId: "prod-hw-01",
    targetProductId: "prod-hw-02", // 4K Thunderbolt Dock
    affinityScore: 90,
    promotionalTag: "PROMOTED",
    rationale: "Complete desktop workstation bundle with dual-4K video and 120W power.",
  },
  {
    id: "rule-lap-ai",
    sourceProductId: "prod-hw-01",
    targetProductId: "prod-sub-02", // AI Predictive Seat
    affinityScore: 78,
    promotionalTag: "MARGIN BOOSTER",
    rationale: "High-margin SaaS subscription seat for sales intelligence.",
  },

  // Server & Networking (prod-hw-03, prod-hw-04)
  {
    id: "rule-srv-deploy",
    sourceProductId: "prod-hw-03",
    targetProductId: "prod-srv-01", // On-Site Deployment
    affinityScore: 98,
    promotionalTag: "PROMOTED",
    rationale: "Turnkey rack installation, firmware staging, and security hardening.",
  },
  {
    id: "rule-srv-sla",
    sourceProductId: "prod-hw-03",
    targetProductId: "prod-srv-04", // 24/7 SLA Support
    affinityScore: 92,
    promotionalTag: "POPULAR PAIRING",
    rationale: "Mission-critical 15-minute SLA with direct priority Tier-3 engineering.",
  },
  {
    id: "rule-sw-deploy",
    sourceProductId: "prod-hw-04",
    targetProductId: "prod-srv-01", // On-Site Deployment
    affinityScore: 88,
    promotionalTag: "BUNDLE DEAL",
    rationale: "Structured cabling, VLAN configuration, and PoE perimeter testing.",
  },
  {
    id: "rule-srv-resilience",
    sourceProductId: "prod-hw-03",
    targetProductId: "prod-sub-04", // Resiliency SaaS
    affinityScore: 84,
    promotionalTag: "MARGIN BOOSTER",
    rationale: "High-margin cloud failover and geo-redundant live replication.",
  },

  // Software & Cloud Platform (prod-sub-01)
  {
    id: "rule-sub-gov",
    sourceProductId: "prod-sub-01",
    targetProductId: "prod-sub-03", // Governance Radar
    affinityScore: 95,
    promotionalTag: "POPULAR PAIRING",
    rationale: "Autonomous discount leak protection and margin corridor governance.",
  },
  {
    id: "rule-sub-ai",
    sourceProductId: "prod-sub-01",
    targetProductId: "prod-sub-02", // AI Predictive Seat
    affinityScore: 91,
    promotionalTag: "MARGIN BOOSTER",
    rationale: "Equip reps with real-time deal scoring and price elasticity recommendations.",
  },
  {
    id: "rule-sub-arch",
    sourceProductId: "prod-sub-01",
    targetProductId: "prod-srv-03", // Architecture Consulting
    affinityScore: 85,
    promotionalTag: "BUNDLE DEAL",
    rationale: "Accelerate customer time-to-value with dedicated enterprise architecture setup.",
  },

  // General Platform Boosters
  {
    id: "rule-gen-care",
    targetProductId: "prod-srv-02", // 2-Year Care Pack
    affinityScore: 72,
    promotionalTag: "POPULAR PAIRING",
    rationale: "Recommended enterprise hardware warranty and accidental damage protection.",
  },
  {
    id: "rule-gen-ai",
    targetProductId: "prod-sub-02", // AI Predictive Seat
    affinityScore: 70,
    promotionalTag: "MARGIN BOOSTER",
    rationale: "High-yield SaaS license that instantly improves overall deal profitability.",
  },
  {
    id: "rule-gen-dock",
    targetProductId: "prod-hw-02", // 4K Thunderbolt Dock
    affinityScore: 65,
    promotionalTag: "PROMOTED",
    rationale: "Universal Thunderbolt peripheral expansion for hybrid workforces.",
  },
];

/**
 * Calculates live ranked upsell and cross-sell recommendations
 * based on the active cart line items and dismissed IDs.
 */
export function getRankedRecommendations(
  cartLines: QuotationLineItem[],
  dismissedRuleIds: string[],
  currentTaxableAmount: number,
  currentTotalCost: number,
  currentBlendedMargin: number
): IRankedRecommendation[] {
  const cartProductIds = new Set(cartLines.map((l) => l.productId));
  const dismissedSet = new Set(dismissedRuleIds);

  const matchedRules: { rule: IUpsellRuleConfig; product: ICatalogProduct; dynamicScore: number }[] = [];
  const seenProductIds = new Set<string>();

  // 1. Identify applicable rules
  for (const rule of UPSELL_RULES) {
    if (dismissedSet.has(rule.id)) continue;
    if (cartProductIds.has(rule.targetProductId)) continue; // Already in cart

    const product = CATALOG_PRODUCTS.find((p) => p.id === rule.targetProductId);
    if (!product) continue;

    let dynamicScore = rule.affinityScore;

    if (rule.sourceProductId) {
      if (cartProductIds.has(rule.sourceProductId)) {
        // Direct co-purchase match! Boost score
        dynamicScore += 20;
      } else {
        // Source not in cart, skip this specific rule
        continue;
      }
    }

    if (rule.promotionalTag === "PROMOTED") dynamicScore += 10;
    if (rule.promotionalTag === "MARGIN BOOSTER") dynamicScore += 15;

    // Avoid duplicate recommended products (keep highest score)
    if (!seenProductIds.has(rule.targetProductId)) {
      seenProductIds.add(rule.targetProductId);
      matchedRules.push({ rule, product, dynamicScore });
    }
  }

  // 2. Sort by dynamic score descending
  matchedRules.sort((a, b) => b.dynamicScore - a.dynamicScore);

  // 3. Compute live margin delta for each candidate
  return matchedRules.map(({ rule, product, dynamicScore }) => {
    // Simulated add: 1 unit at list price (0% discount)
    const addPrice = product.basePrice;
    const addCost = product.unitCost;

    let potentialBlendedMargin: number;
    let marginDeltaPercent: number;

    if (currentTaxableAmount <= 0) {
      // Empty cart case
      potentialBlendedMargin = parseFloat((((addPrice - addCost) / addPrice) * 100).toFixed(1));
      marginDeltaPercent = potentialBlendedMargin;
    } else {
      const newTaxable = currentTaxableAmount + addPrice;
      const newCost = currentTotalCost + addCost;
      potentialBlendedMargin = parseFloat((((newTaxable - newCost) / newTaxable) * 100).toFixed(1));
      marginDeltaPercent = parseFloat((potentialBlendedMargin - currentBlendedMargin).toFixed(1));
    }

    return {
      ruleId: rule.id,
      product,
      affinityScore: dynamicScore,
      promotionalTag: rule.promotionalTag || null,
      rationale: rule.rationale,
      marginDeltaPercent,
      potentialBlendedMargin,
      isMarginBooster: marginDeltaPercent >= 0,
    };
  });
}
