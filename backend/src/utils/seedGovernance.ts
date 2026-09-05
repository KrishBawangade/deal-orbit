import { CustomerTier, ProductCategory } from '@prisma/client';
import { prisma } from '../config/database';

export const seedGovernanceData = async (): Promise<void> => {
  console.log('🌱 Seeding Governance Categories, Discount Ceilings, and Approval Chains...');

  // 1. Seed Categories with Default Ceilings
  const categoriesData = [
    {
      name: ProductCategory.HARDWARE,
      description: 'Physical computing hardware, enterprise laptops, and docking stations',
      defaultCeilingDiscount: 15.0,
    },
    {
      name: ProductCategory.SOFTWARE,
      description: 'Enterprise software licenses, SaaS subscriptions, and cloud tools',
      defaultCeilingDiscount: 20.0,
    },
    {
      name: ProductCategory.SERVICES,
      description: 'Professional consulting, on-site deployment, and support SLAs',
      defaultCeilingDiscount: 10.0,
    },
  ];

  const categoryMap = new Map<ProductCategory, string>();

  for (const cat of categoriesData) {
    const record = await prisma.category.upsert({
      where: { name: cat.name },
      update: {
        description: cat.description,
        defaultCeilingDiscount: cat.defaultCeilingDiscount,
      },
      create: {
        name: cat.name,
        description: cat.description,
        defaultCeilingDiscount: cat.defaultCeilingDiscount,
      },
    });
    categoryMap.set(cat.name, record.id);
    console.log(`   ✓ Category ${cat.name} ready (Default Ceiling: ${cat.defaultCeilingDiscount}%)`);
  }

  // 2. Seed Baseline Discount Ceilings for Customer Tiers & Categories
  const ceilingMatrix: Array<{
    tier: CustomerTier;
    category: ProductCategory;
    maxDiscount: number;
  }> = [
    // Bronze Tier (Base 5%)
    { tier: CustomerTier.BRONZE, category: ProductCategory.HARDWARE, maxDiscount: 5.0 },
    { tier: CustomerTier.BRONZE, category: ProductCategory.SOFTWARE, maxDiscount: 5.0 },
    { tier: CustomerTier.BRONZE, category: ProductCategory.SERVICES, maxDiscount: 5.0 },

    // Silver Tier (Base 10%)
    { tier: CustomerTier.SILVER, category: ProductCategory.HARDWARE, maxDiscount: 10.0 },
    { tier: CustomerTier.SILVER, category: ProductCategory.SOFTWARE, maxDiscount: 10.0 },
    { tier: CustomerTier.SILVER, category: ProductCategory.SERVICES, maxDiscount: 10.0 },

    // Gold Tier (Base 15%, but Services capped at 10%)
    { tier: CustomerTier.GOLD, category: ProductCategory.HARDWARE, maxDiscount: 15.0 },
    { tier: CustomerTier.GOLD, category: ProductCategory.SOFTWARE, maxDiscount: 15.0 },
    { tier: CustomerTier.GOLD, category: ProductCategory.SERVICES, maxDiscount: 10.0 },

    // Enterprise Tier (Base 20%, but Hardware capped at 15%, Services at 10%)
    { tier: CustomerTier.ENTERPRISE, category: ProductCategory.HARDWARE, maxDiscount: 15.0 },
    { tier: CustomerTier.ENTERPRISE, category: ProductCategory.SOFTWARE, maxDiscount: 20.0 },
    { tier: CustomerTier.ENTERPRISE, category: ProductCategory.SERVICES, maxDiscount: 10.0 },
  ];

  for (const item of ceilingMatrix) {
    const categoryId = categoryMap.get(item.category);
    if (categoryId) {
      await prisma.discountCeiling.upsert({
        where: {
          customerTier_categoryId: {
            customerTier: item.tier,
            categoryId,
          },
        },
        update: {
          maxDiscountPercent: item.maxDiscount,
        },
        create: {
          customerTier: item.tier,
          categoryId,
          maxDiscountPercent: item.maxDiscount,
        },
      });
    }
  }
  console.log('   ✓ Customer Tier × Category Discount Ceilings matrix seeded');

  // 3. Seed Approval Chain Rules (Risk Score Bands)
  const approvalRules = [
    {
      minRiskScore: 0.0,
      maxRiskScore: 20.0,
      requiresManager: false,
      requiresFinance: false,
      description: 'Tier 0: Auto-Approved (Within standard risk & discount tolerance)',
    },
    {
      minRiskScore: 20.01,
      maxRiskScore: 50.0,
      requiresManager: true,
      requiresFinance: false,
      description: 'Tier 1: Sales Manager Approval (Moderate discount overage or risk leakage)',
    },
    {
      minRiskScore: 50.01,
      maxRiskScore: 100.0,
      requiresManager: true,
      requiresFinance: true,
      description:
        'Tier 2: Sales Manager followed by Finance Director (High risk score or severe margin erosion)',
    },
  ];

  for (const rule of approvalRules) {
    const existing = await prisma.approvalChainRule.findFirst({
      where: {
        minRiskScore: rule.minRiskScore,
        maxRiskScore: rule.maxRiskScore,
      },
    });

    if (existing) {
      await prisma.approvalChainRule.update({
        where: { id: existing.id },
        data: {
          requiresManager: rule.requiresManager,
          requiresFinance: rule.requiresFinance,
          description: rule.description,
        },
      });
    } else {
      await prisma.approvalChainRule.create({
        data: rule,
      });
    }
  }
  console.log('   ✓ Multi-Tier Approval Chain Rules seeded');
  console.log('✅ Governance seeding complete!');
};

// Allow standalone invocation: ts-node seedGovernance.ts
if (require.main === module) {
  seedGovernanceData()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seeding failed:', err);
      process.exit(1);
    });
}
