import { Prisma, ProductCategory, BillingFrequency } from '@prisma/client';
import { prisma } from '../config/database';

export const seedProductsData = async (): Promise<void> => {
  console.log('🌱 Seeding Product Categories, Regional Warehouses, 12 Products, Variants, Stock, and Upsell Rules...');

  // ==========================================
  // 1. Ensure Categories
  // ==========================================
  const categoriesData = [
    {
      name: ProductCategory.HARDWARE,
      description: 'Physical computing hardware, enterprise laptops, docking stations, server nodes, switches',
      defaultCeilingDiscount: 15.0,
    },
    {
      name: ProductCategory.SOFTWARE,
      description: 'Enterprise software licenses, SaaS subscriptions, cloud tools, and AI copilot seats',
      defaultCeilingDiscount: 20.0,
    },
    {
      name: ProductCategory.SERVICES,
      description: 'Professional consulting, on-site deployment, architecture audits, and 24/7 support SLAs',
      defaultCeilingDiscount: 10.0,
    },
  ];

  const categoryMap = new Map<ProductCategory, string>();
  for (const cat of categoriesData) {
    const record = await prisma.category.upsert({
      where: { name: cat.name },
      update: {
        description: cat.description,
        defaultCeilingDiscount: new Prisma.Decimal(cat.defaultCeilingDiscount),
      },
      create: {
        name: cat.name,
        description: cat.description,
        defaultCeilingDiscount: new Prisma.Decimal(cat.defaultCeilingDiscount),
      },
    });
    categoryMap.set(cat.name, record.id);
    console.log(`   ✓ Category: ${cat.name} ready (ID: ${record.id})`);
  }

  // ==========================================
  // 2. Regional Warehouses (For Auto-Split & Fulfillment)
  // ==========================================
  const warehousesData = [
    {
      code: 'WH-BOM-01',
      name: 'Main Central Hub',
      address: 'Bhiwandi Logistics Park, Mumbai, MH - 421302',
      priorityOrder: 1,
      shippingCostWeight: 1.0,
      isActive: true,
    },
    {
      code: 'WH-CCU-02',
      name: 'East Regional Depot',
      address: 'Dankuni Industrial Estate, Kolkata, WB - 712311',
      priorityOrder: 2,
      shippingCostWeight: 1.3,
      isActive: true,
    },
    {
      code: 'WH-AMD-03',
      name: 'West Regional Hub',
      address: 'Changodar Logistics Cluster, Ahmedabad, GJ - 382213',
      priorityOrder: 3,
      shippingCostWeight: 1.15,
      isActive: true,
    },
  ];

  const warehouseMap = new Map<string, string>();
  for (const wh of warehousesData) {
    const record = await prisma.warehouse.upsert({
      where: { code: wh.code },
      update: {
        name: wh.name,
        address: wh.address,
        priorityOrder: wh.priorityOrder,
        shippingCostWeight: new Prisma.Decimal(wh.shippingCostWeight),
        isActive: wh.isActive,
      },
      create: {
        code: wh.code,
        name: wh.name,
        address: wh.address,
        priorityOrder: wh.priorityOrder,
        shippingCostWeight: new Prisma.Decimal(wh.shippingCostWeight),
        isActive: wh.isActive,
      },
    });
    warehouseMap.set(wh.code, record.id);
    console.log(`   ✓ Warehouse: ${wh.name} (${wh.code}, Weight: ${wh.shippingCostWeight})`);
  }

  // ==========================================
  // 3. The 12 Canonical Products
  // ==========================================
  const productsData = [
    // --- HARDWARE ---
    {
      sku: 'HW-LAPTOP-16',
      name: 'Enterprise Pro Laptop 16" (M3 Max / 64GB / 1TB)',
      category: ProductCategory.HARDWARE,
      basePrice: 85000,
      costPrice: 65000,
      unit: 'Unit',
      taxRate: 18.0,
      description: 'High-performance enterprise workstation with discrete GPU and enterprise security module.',
      isPromoted: true,
      minMarginThreshold: 18.0,
      isRecurringDefault: false,
      defaultBillingCycle: BillingFrequency.ONE_TIME,
      stockAllocation: {
        'WH-BOM-01': 25,
        'WH-CCU-02': 12,
        'WH-AMD-03': 8, // Total: 45
      },
      variants: [
        { attributeName: 'Memory', attributeValue: '64GB Unified', priceDelta: 0, costDelta: 0 },
        { attributeName: 'Memory', attributeValue: '128GB Unified', priceDelta: 22000, costDelta: 15000, skuModifier: '128GB' },
        { attributeName: 'Storage', attributeValue: '2TB NVMe Upgrade', priceDelta: 14000, costDelta: 9000, skuModifier: '2TB' },
      ],
    },
    {
      sku: 'HW-DOCK-4K',
      name: 'UltraHD 4K Thunderbolt Docking Station 120W',
      category: ProductCategory.HARDWARE,
      basePrice: 18500,
      costPrice: 12000,
      unit: 'Unit',
      taxRate: 18.0,
      description: 'Dual 4K display output, 120W power delivery, GbE and 8 peripheral ports.',
      isPromoted: false,
      minMarginThreshold: 15.0,
      isRecurringDefault: false,
      defaultBillingCycle: BillingFrequency.ONE_TIME,
      stockAllocation: {
        'WH-BOM-01': 45,
        'WH-CCU-02': 25,
        'WH-AMD-03': 10, // Total: 80
      },
      variants: [],
    },
    {
      sku: 'HW-SRV-R750',
      name: 'Performance Server Node R750 (2U Rackmount)',
      category: ProductCategory.HARDWARE,
      basePrice: 240000,
      costPrice: 180000,
      unit: 'Unit',
      taxRate: 18.0,
      description: 'Dual Intel Xeon Gold, 128GB ECC RAM, redundant hot-swap power supplies.',
      isPromoted: true,
      minMarginThreshold: 20.0,
      isRecurringDefault: false,
      defaultBillingCycle: BillingFrequency.ONE_TIME,
      stockAllocation: {
        'WH-BOM-01': 7,
        'WH-CCU-02': 3,
        'WH-AMD-03': 2, // Total: 12
      },
      variants: [
        { attributeName: 'Chassis', attributeValue: '1U Rackmount Compact', priceDelta: 0, costDelta: 0 },
        { attributeName: 'Chassis', attributeValue: '2U High-Airflow Redundant', priceDelta: 35000, costDelta: 22000, skuModifier: '2U-RED' },
      ],
    },
    {
      sku: 'HW-SW-48P',
      name: 'High-Density Managed PoE Switch 48-Port L3',
      category: ProductCategory.HARDWARE,
      basePrice: 62000,
      costPrice: 44000,
      unit: 'Unit',
      taxRate: 18.0,
      description: 'Enterprise multi-gigabit switch with layer-3 routing and cloud management.',
      isPromoted: false,
      minMarginThreshold: 18.0,
      isRecurringDefault: false,
      defaultBillingCycle: BillingFrequency.ONE_TIME,
      stockAllocation: {
        'WH-BOM-01': 15,
        'WH-CCU-02': 6,
        'WH-AMD-03': 4, // Total: 25
      },
      variants: [],
    },

    // --- SERVICES ---
    {
      sku: 'SRV-DEPLOY-ONSITE',
      name: 'On-Site Hardware Deployment & Provisioning',
      category: ProductCategory.SERVICES,
      basePrice: 120000,
      costPrice: 85000,
      unit: 'Engagement',
      taxRate: 18.0,
      description: 'Turnkey rack installation, OS imaging, zero-touch staging, and perimeter testing.',
      isPromoted: false,
      minMarginThreshold: 15.0,
      isRecurringDefault: false,
      defaultBillingCycle: BillingFrequency.ONE_TIME,
      stockAllocation: {}, // Unconstrained service
      variants: [],
    },
    {
      sku: 'SRV-CARE-2YR',
      name: '2-Year Enterprise Care Pack & Next-Day Onsite SLA',
      category: ProductCategory.SERVICES,
      basePrice: 18000,
      costPrice: 10500,
      unit: 'License',
      taxRate: 18.0,
      description: 'Comprehensive accidental damage protection with 4-hour critical response guarantee.',
      isPromoted: true,
      minMarginThreshold: 25.0,
      isRecurringDefault: false,
      defaultBillingCycle: BillingFrequency.ONE_TIME,
      stockAllocation: {},
      variants: [],
    },
    {
      sku: 'SRV-CONSULT-ARCH',
      name: 'Enterprise Architecture & Migration Consulting',
      category: ProductCategory.SERVICES,
      basePrice: 95000,
      costPrice: 60000,
      unit: 'Package',
      taxRate: 18.0,
      description: 'Certified cloud architects for topology audit, capacity planning, and security hardening.',
      isPromoted: false,
      minMarginThreshold: 20.0,
      isRecurringDefault: false,
      defaultBillingCycle: BillingFrequency.ONE_TIME,
      stockAllocation: {},
      variants: [],
    },
    {
      sku: 'SRV-SUPP-247',
      name: '24/7 Dedicated Operational Support SLA (Annual)',
      category: ProductCategory.SERVICES,
      basePrice: 45000,
      costPrice: 25000,
      unit: 'Annual',
      taxRate: 18.0,
      description: 'Direct priority line to Tier-3 support engineers with guaranteed 15-min response time.',
      isPromoted: false,
      minMarginThreshold: 25.0,
      isRecurringDefault: false,
      defaultBillingCycle: BillingFrequency.ONE_TIME,
      stockAllocation: {},
      variants: [
        { attributeName: 'Response SLA', attributeValue: '4-Hour Response SLA', priceDelta: 0, costDelta: 0 },
        { attributeName: 'Response SLA', attributeValue: '15-Min Critical Response SLA', priceDelta: 20000, costDelta: 10000, skuModifier: '15MIN' },
      ],
    },

    // --- SUBSCRIPTIONS (Software / SaaS recurring) ---
    {
      sku: 'SUB-PLATFORM-ENT',
      name: 'DealOrbit Cloud Platform Enterprise License',
      category: ProductCategory.SOFTWARE,
      basePrice: 25000,
      costPrice: 5000,
      unit: 'Month',
      taxRate: 18.0,
      description: 'Complete commercial governance platform with role controls, live margins & ERP sync.',
      isPromoted: true,
      minMarginThreshold: 30.0,
      isRecurringDefault: true,
      defaultBillingCycle: BillingFrequency.MONTHLY,
      stockAllocation: {},
      variants: [],
    },
    {
      sku: 'SUB-AI-SEAT',
      name: 'Deal Strategy AI Predictive Seat',
      category: ProductCategory.SOFTWARE,
      basePrice: 6500,
      costPrice: 1200,
      unit: 'Seat/mo',
      taxRate: 18.0,
      description: 'Real-time deal corridor prediction, customer price elasticity, and discount recommendations.',
      isPromoted: true,
      minMarginThreshold: 35.0,
      isRecurringDefault: true,
      defaultBillingCycle: BillingFrequency.MONTHLY,
      stockAllocation: {},
      variants: [],
    },
    {
      sku: 'SUB-GOV-RADAR',
      name: 'Threat & Governance Radar License',
      category: ProductCategory.SOFTWARE,
      basePrice: 38000,
      costPrice: 8000,
      unit: 'Month',
      taxRate: 18.0,
      description: 'Autonomous margin leakage detection, discount anomaly alerts, and multi-tier approval routing.',
      isPromoted: false,
      minMarginThreshold: 30.0,
      isRecurringDefault: true,
      defaultBillingCycle: BillingFrequency.MONTHLY,
      stockAllocation: {},
      variants: [],
    },
    {
      sku: 'SUB-RESILIENCE',
      name: 'Multi-Region Enterprise Data Resiliency SaaS',
      category: ProductCategory.SOFTWARE,
      basePrice: 52000,
      costPrice: 14000,
      unit: 'Month',
      taxRate: 18.0,
      description: 'Active-active database replication, geo-redundant backups, and 99.999% uptime guarantee.',
      isPromoted: false,
      minMarginThreshold: 30.0,
      isRecurringDefault: true,
      defaultBillingCycle: BillingFrequency.MONTHLY,
      stockAllocation: {},
      variants: [],
    },
  ];

  const productMap = new Map<string, string>(); // sku -> productId

  for (const p of productsData) {
    const categoryId = categoryMap.get(p.category);
    if (!categoryId) continue;

    const productRecord = await prisma.product.upsert({
      where: { sku: p.sku },
      update: {
        name: p.name,
        categoryId,
        basePrice: new Prisma.Decimal(p.basePrice),
        costPrice: new Prisma.Decimal(p.costPrice),
        unit: p.unit,
        taxRate: new Prisma.Decimal(p.taxRate),
        description: p.description,
        isPromoted: p.isPromoted,
        minMarginThreshold: new Prisma.Decimal(p.minMarginThreshold),
        isRecurringDefault: p.isRecurringDefault,
        defaultBillingCycle: p.defaultBillingCycle,
        isActive: true,
      },
      create: {
        sku: p.sku,
        name: p.name,
        categoryId,
        basePrice: new Prisma.Decimal(p.basePrice),
        costPrice: new Prisma.Decimal(p.costPrice),
        unit: p.unit,
        taxRate: new Prisma.Decimal(p.taxRate),
        description: p.description,
        isPromoted: p.isPromoted,
        minMarginThreshold: new Prisma.Decimal(p.minMarginThreshold),
        isRecurringDefault: p.isRecurringDefault,
        defaultBillingCycle: p.defaultBillingCycle,
        isActive: true,
      },
    });

    productMap.set(p.sku, productRecord.id);
    console.log(`   ✓ Product: ${p.sku} | ${p.name} (Base: ₹${p.basePrice.toLocaleString()}, Cost: ₹${p.costPrice.toLocaleString()})`);

    // Variants
    if (p.variants && p.variants.length > 0) {
      for (const v of p.variants) {
        const existingVariant = await prisma.productVariant.findFirst({
          where: {
            productId: productRecord.id,
            attributeName: v.attributeName,
            attributeValue: v.attributeValue,
          },
        });

        if (existingVariant) {
          await prisma.productVariant.update({
            where: { id: existingVariant.id },
            data: {
              priceDelta: new Prisma.Decimal(v.priceDelta),
              costDelta: new Prisma.Decimal(v.costDelta),
              skuModifier: v.skuModifier || null,
            },
          });
        } else {
          await prisma.productVariant.create({
            data: {
              productId: productRecord.id,
              attributeName: v.attributeName,
              attributeValue: v.attributeValue,
              priceDelta: new Prisma.Decimal(v.priceDelta),
              costDelta: new Prisma.Decimal(v.costDelta),
              skuModifier: v.skuModifier || null,
            },
          });
        }
      }
      console.log(`     └─ ${p.variants.length} Variants configured`);
    }

    // Warehouse Stock Allocation (for physical hardware)
    for (const [whCode, qty] of Object.entries(p.stockAllocation)) {
      const warehouseId = warehouseMap.get(whCode);
      if (!warehouseId) continue;

      await prisma.warehouseStock.upsert({
        where: {
          warehouseId_productId: {
            warehouseId,
            productId: productRecord.id,
          },
        },
        update: {
          onHandQuantity: qty,
          reservedQuantity: 0,
          reorderThreshold: 5,
        },
        create: {
          warehouseId,
          productId: productRecord.id,
          onHandQuantity: qty,
          reservedQuantity: 0,
          reorderThreshold: 5,
        },
      });
      console.log(`     └─ Stock: ${qty} units allocated to ${whCode}`);
    }
  }

  // ==========================================
  // 4. Upsell & Cross-Sell Rules
  // ==========================================
  const upsellRulesData = [
    {
      sourceSku: 'HW-LAPTOP-16',
      targetSku: 'SRV-CARE-2YR',
      affinityScore: 0.88,
      marginDeltaPercent: 2.5,
      promotionalTag: 'POPULAR_PAIRING',
    },
    {
      sourceSku: 'HW-LAPTOP-16',
      targetSku: 'HW-DOCK-4K',
      affinityScore: 0.75,
      marginDeltaPercent: 1.8,
      promotionalTag: 'WORKSTATION_ATTACH',
    },
    {
      sourceSku: 'HW-SRV-R750',
      targetSku: 'SRV-DEPLOY-ONSITE',
      affinityScore: 0.82,
      marginDeltaPercent: 3.2,
      promotionalTag: 'ESSENTIAL_ATTACHMENT',
    },
    {
      sourceSku: 'HW-SRV-R750',
      targetSku: 'SUB-PLATFORM-ENT',
      affinityScore: 0.70,
      marginDeltaPercent: 4.5,
      promotionalTag: 'ENTERPRISE_BUNDLE',
    },
    {
      sourceSku: 'SUB-PLATFORM-ENT',
      targetSku: 'SUB-AI-SEAT',
      affinityScore: 0.85,
      marginDeltaPercent: 3.0,
      promotionalTag: 'HIGH_MARGIN_BOOST',
    },
    {
      sourceSku: 'SUB-PLATFORM-ENT',
      targetSku: 'SUB-GOV-RADAR',
      affinityScore: 0.65,
      marginDeltaPercent: 2.8,
      promotionalTag: 'GOVERNANCE_EXPANSION',
    },
    {
      sourceSku: 'HW-SW-48P',
      targetSku: 'SRV-CONSULT-ARCH',
      affinityScore: 0.68,
      marginDeltaPercent: 2.2,
      promotionalTag: 'NETWORK_AUDIT',
    },
  ];

  for (const rule of upsellRulesData) {
    const sourceId = productMap.get(rule.sourceSku);
    const targetId = productMap.get(rule.targetSku);

    if (sourceId && targetId) {
      await prisma.upsellRule.upsert({
        where: {
          sourceProductId_recommendedProductId: {
            sourceProductId: sourceId,
            recommendedProductId: targetId,
          },
        },
        update: {
          affinityScore: new Prisma.Decimal(rule.affinityScore),
          marginDeltaPercent: new Prisma.Decimal(rule.marginDeltaPercent),
          promotionalTag: rule.promotionalTag,
          isActive: true,
        },
        create: {
          sourceProductId: sourceId,
          recommendedProductId: targetId,
          affinityScore: new Prisma.Decimal(rule.affinityScore),
          marginDeltaPercent: new Prisma.Decimal(rule.marginDeltaPercent),
          promotionalTag: rule.promotionalTag,
          isActive: true,
        },
      });
      console.log(`   ✓ Upsell Rule: ${rule.sourceSku} ➔ ${rule.targetSku} (+Δ${rule.marginDeltaPercent}%, Tag: ${rule.promotionalTag})`);
    }
  }

  console.log('\n🎉 Product Catalog, Warehouses, Stock & Upsell Rules seeded successfully!');
};

// Allow standalone execution: npx tsx src/utils/seedProducts.ts
if (require.main === module) {
  seedProductsData()
    .then(async () => {
      await prisma.$disconnect();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('❌ Seeding failed:', err);
      await prisma.$disconnect();
      process.exit(1);
    });
}
