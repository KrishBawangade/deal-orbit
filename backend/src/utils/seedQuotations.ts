import { Prisma, CustomerTier, ProductCategory, QuoteStatus, ApprovalStatus, BillingFrequency } from '@prisma/client';
import { prisma } from '../config/database';

export const seedQuotationsData = async (): Promise<void> => {
  console.log('🌱 Seeding Comprehensive Customers, Products & Quotations...');

  // 1. Ensure Product Categories
  const categories = [
    { name: ProductCategory.HARDWARE, description: 'Physical computing hardware, enterprise laptops, docking stations', defaultCeilingDiscount: 15.0 },
    { name: ProductCategory.SOFTWARE, description: 'Enterprise software licenses, SaaS subscriptions, cloud tools', defaultCeilingDiscount: 20.0 },
    { name: ProductCategory.SERVICES, description: 'Professional consulting, on-site deployment, support SLAs', defaultCeilingDiscount: 10.0 },
  ];

  const categoryMap = new Map<ProductCategory, string>();
  for (const cat of categories) {
    const record = await prisma.category.upsert({
      where: { name: cat.name },
      update: { description: cat.description, defaultCeilingDiscount: cat.defaultCeilingDiscount },
      create: { name: cat.name, description: cat.description, defaultCeilingDiscount: cat.defaultCeilingDiscount },
    });
    categoryMap.set(cat.name, record.id);
  }

  // 2. Ensure Core Products
  const productsData = [
    {
      sku: 'HW-LAPTOP-16',
      name: 'Enterprise Pro Laptop 16" (M3 Max / 64GB / 1TB)',
      category: ProductCategory.HARDWARE,
      basePrice: 85000,
      costPrice: 65000,
      unit: 'Unit',
      taxRate: 18.0,
      minMarginThreshold: 18.0,
    },
    {
      sku: 'SRV-DEPLOY-ONSITE',
      name: 'On-Site Hardware Deployment & Provisioning',
      category: ProductCategory.SERVICES,
      basePrice: 120000,
      costPrice: 85000,
      unit: 'Deployment',
      taxRate: 18.0,
      minMarginThreshold: 15.0,
    },
    {
      sku: 'SW-SEC-01',
      name: 'Cloud Security Suite & Zero Trust Gateway',
      category: ProductCategory.SOFTWARE,
      basePrice: 45000,
      costPrice: 22000,
      unit: 'License',
      taxRate: 18.0,
      minMarginThreshold: 20.0,
    },
    {
      sku: 'SW-DB-02',
      name: 'Enterprise Database Managed Cluster (HA)',
      category: ProductCategory.SOFTWARE,
      basePrice: 95000,
      costPrice: 50000,
      unit: 'Cluster',
      taxRate: 18.0,
      minMarginThreshold: 20.0,
    },
    {
      sku: 'SRV-TAM-01',
      name: '24/7 Dedicated Technical Account Manager',
      category: ProductCategory.SERVICES,
      basePrice: 150000,
      costPrice: 90000,
      unit: 'Contract',
      taxRate: 18.0,
      minMarginThreshold: 25.0,
    },
    {
      sku: 'HW-DOCK-01',
      name: 'Docking Station Pro Dual 4K',
      category: ProductCategory.HARDWARE,
      basePrice: 18000,
      costPrice: 11000,
      unit: 'Unit',
      taxRate: 18.0,
      minMarginThreshold: 15.0,
    },
  ];

  const productMap = new Map<string, any>();
  for (const p of productsData) {
    const catId = categoryMap.get(p.category);
    if (!catId) continue;

    const record = await prisma.product.upsert({
      where: { sku: p.sku },
      update: {
        name: p.name,
        categoryId: catId,
        basePrice: new Prisma.Decimal(p.basePrice),
        costPrice: new Prisma.Decimal(p.costPrice),
        unit: p.unit,
        taxRate: new Prisma.Decimal(p.taxRate),
        minMarginThreshold: new Prisma.Decimal(p.minMarginThreshold),
        isActive: true,
      },
      create: {
        sku: p.sku,
        name: p.name,
        categoryId: catId,
        basePrice: new Prisma.Decimal(p.basePrice),
        costPrice: new Prisma.Decimal(p.costPrice),
        unit: p.unit,
        taxRate: new Prisma.Decimal(p.taxRate),
        minMarginThreshold: new Prisma.Decimal(p.minMarginThreshold),
        isActive: true,
      },
    });
    productMap.set(p.sku, record);
    console.log(`   ✓ Product ready: ${record.sku} (${record.name})`);
  }

  // 3. Ensure Enterprise Customers
  const customersData = [
    {
      code: 'CUST-ACME',
      name: 'Acme Corp',
      tier: CustomerTier.GOLD,
      contactEmail: 'customer.acme@dealorbit.io',
      paymentTerms: 'Net 30',
      profile: { priceSensitivity: 'HIGH', minDisc: 5.0, maxDisc: 15.0, serviceAffinity: 0.75 },
    },
    {
      code: 'CUST-STARK',
      name: 'Stark Enterprises',
      tier: CustomerTier.ENTERPRISE,
      contactEmail: 'procurement@starkenterprises.com',
      paymentTerms: 'Net 60',
      profile: { priceSensitivity: 'MEDIUM', minDisc: 8.0, maxDisc: 20.0, serviceAffinity: 0.9 },
    },
    {
      code: 'CUST-WAYNE',
      name: 'Wayne Enterprises',
      tier: CustomerTier.ENTERPRISE,
      contactEmail: 'supply@waynecorp.com',
      paymentTerms: 'Net 45',
      profile: { priceSensitivity: 'LOW', minDisc: 10.0, maxDisc: 25.0, serviceAffinity: 0.6 },
    },
    {
      code: 'CUST-CYBER',
      name: 'Cyberdyne Systems',
      tier: CustomerTier.SILVER,
      contactEmail: 'procure@cyberdyne.io',
      paymentTerms: 'Net 30',
      profile: { priceSensitivity: 'HIGH', minDisc: 3.0, maxDisc: 10.0, serviceAffinity: 0.4 },
    },
    {
      code: 'CUST-OSCORP',
      name: 'Oscorp Industries',
      tier: CustomerTier.BRONZE,
      contactEmail: 'purchasing@oscorp.org',
      paymentTerms: 'Net 15',
      profile: { priceSensitivity: 'HIGH', minDisc: 2.0, maxDisc: 5.0, serviceAffinity: 0.3 },
    },
  ];

  const customerMap = new Map<string, any>();
  for (const c of customersData) {
    const cust = await prisma.customer.upsert({
      where: { code: c.code },
      update: {
        name: c.name,
        contactEmail: c.contactEmail,
        tier: c.tier,
        paymentTerms: c.paymentTerms,
        isActive: true,
      },
      create: {
        code: c.code,
        name: c.name,
        contactEmail: c.contactEmail,
        tier: c.tier,
        paymentTerms: c.paymentTerms,
        isActive: true,
      },
    });

    await prisma.customerNegotiationProfile.upsert({
      where: { customerId: cust.id },
      update: {
        priceSensitivity: c.profile.priceSensitivity,
        historicalMinDiscount: new Prisma.Decimal(c.profile.minDisc),
        historicalMaxDiscount: new Prisma.Decimal(c.profile.maxDisc),
        serviceAffinity: new Prisma.Decimal(c.profile.serviceAffinity),
      },
      create: {
        customerId: cust.id,
        priceSensitivity: c.profile.priceSensitivity,
        historicalMinDiscount: new Prisma.Decimal(c.profile.minDisc),
        historicalMaxDiscount: new Prisma.Decimal(c.profile.maxDisc),
        serviceAffinity: new Prisma.Decimal(c.profile.serviceAffinity),
      },
    });

    customerMap.set(c.code, cust);
    console.log(`   ✓ Customer ready: ${cust.name} (${cust.tier} Tier)`);
  }

  // 4. Resolve Rep & Approver Users
  const salesRep = await prisma.user.findFirst({ where: { role: 'SALES_REP' } });
  const salesManager = await prisma.user.findFirst({ where: { role: 'SALES_MANAGER' } });
  const financeOps = await prisma.user.findFirst({ where: { role: 'FINANCE_OPS' } });

  if (!salesRep) {
    throw new Error('Sales Rep user not found in database. Run seedUsers first.');
  }

  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const in14Days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  // 5. Seed Demo Quotations
  const quotationsSeed = [
    // 5.1 QT-2026-0043: Acme Corp (GOLD) - CUSTOMER_REVIEW with demo-token
    {
      quoteNumber: 'QT-2026-0043',
      version: 1,
      customerCode: 'CUST-ACME',
      salesRepId: salesRep.id,
      status: QuoteStatus.CUSTOMER_REVIEW,
      paymentTerms: 'Net 30',
      portalToken: 'demo-token',
      portalTokenExpiresAt: in30Days,
      expiresAt: in14Days,
      subtotalAmount: new Prisma.Decimal(1820000),
      totalDiscountAmount: new Prisma.Decimal(225600),
      taxAmount: new Prisma.Decimal(286992),
      grandTotal: new Prisma.Decimal(1881392),
      totalCostBasis: new Prisma.Decimal(1385000),
      dealMarginPercent: new Prisma.Decimal(18.4),
      blendedRiskScore: new Prisma.Decimal(38.5),
      lines: [
        {
          sku: 'HW-LAPTOP-16',
          quantity: 20,
          unitPrice: new Prisma.Decimal(85000),
          unitCost: new Prisma.Decimal(65000),
          discountPercent: new Prisma.Decimal(12.0),
          effectiveCeiling: new Prisma.Decimal(15.0),
          isViolation: false,
          violationPoints: new Prisma.Decimal(0.0),
          netLinePrice: new Prisma.Decimal(1496000),
          lineMarginPercent: new Prisma.Decimal(23.5),
          isRecurring: false,
          billingFrequency: BillingFrequency.ONE_TIME,
        },
        {
          sku: 'SRV-DEPLOY-ONSITE',
          quantity: 1,
          unitPrice: new Prisma.Decimal(120000),
          unitCost: new Prisma.Decimal(85000),
          discountPercent: new Prisma.Decimal(18.0),
          effectiveCeiling: new Prisma.Decimal(10.0),
          isViolation: true,
          violationPoints: new Prisma.Decimal(8.0),
          netLinePrice: new Prisma.Decimal(98400),
          lineMarginPercent: new Prisma.Decimal(-1.6),
          isRecurring: false,
          billingFrequency: BillingFrequency.ONE_TIME,
        },
      ],
      approvalRequests: salesManager
        ? [
            {
              approverId: salesManager.id,
              tierLevel: 1,
              status: ApprovalStatus.APPROVED,
              decisionReason: 'Strategic Gold Tier renewal exception approved for hardware volume.',
              requestedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
              decidedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
            },
          ]
        : [],
      negotiationThreads: [
        {
          authorRole: 'CUSTOMER',
          authorName: 'Jordan Procurement (Acme Corp)',
          message: 'Can delivery timeline be accelerated to 48 hours for the first 10 laptop units?',
          proposedDiscount: new Prisma.Decimal(12.0),
        },
        {
          authorRole: 'SALES_REP',
          authorName: `${salesRep.name} (DealOrbit Rep)`,
          message: 'Yes! Inventory is pre-staged across regional hubs. We can dispatch 10 units within 24 hours of confirmation.',
          proposedDiscount: null,
        },
      ],
    },

    // 5.2 QT-2026-0044: Stark Enterprises (ENTERPRISE) - APPROVED
    {
      quoteNumber: 'QT-2026-0044',
      version: 1,
      customerCode: 'CUST-STARK',
      salesRepId: salesRep.id,
      status: QuoteStatus.APPROVED,
      paymentTerms: 'Net 60',
      portalToken: 'stark-token',
      portalTokenExpiresAt: in30Days,
      expiresAt: in30Days,
      subtotalAmount: new Prisma.Decimal(790000),
      totalDiscountAmount: new Prisma.Decimal(62500),
      taxAmount: new Prisma.Decimal(130950),
      grandTotal: new Prisma.Decimal(858450),
      totalCostBasis: new Prisma.Decimal(410000),
      dealMarginPercent: new Prisma.Decimal(43.6),
      blendedRiskScore: new Prisma.Decimal(12.0),
      lines: [
        {
          sku: 'SW-SEC-01',
          quantity: 10,
          unitPrice: new Prisma.Decimal(45000),
          unitCost: new Prisma.Decimal(22000),
          discountPercent: new Prisma.Decimal(8.0),
          effectiveCeiling: new Prisma.Decimal(20.0),
          isViolation: false,
          violationPoints: new Prisma.Decimal(0.0),
          netLinePrice: new Prisma.Decimal(414000),
          lineMarginPercent: new Prisma.Decimal(46.8),
          isRecurring: false,
          billingFrequency: BillingFrequency.ONE_TIME,
        },
        {
          sku: 'SW-DB-02',
          quantity: 2,
          unitPrice: new Prisma.Decimal(95000),
          unitCost: new Prisma.Decimal(50000),
          discountPercent: new Prisma.Decimal(10.0),
          effectiveCeiling: new Prisma.Decimal(20.0),
          isViolation: false,
          violationPoints: new Prisma.Decimal(0.0),
          netLinePrice: new Prisma.Decimal(171000),
          lineMarginPercent: new Prisma.Decimal(41.5),
          isRecurring: false,
          billingFrequency: BillingFrequency.ONE_TIME,
        },
        {
          sku: 'SRV-TAM-01',
          quantity: 1,
          unitPrice: new Prisma.Decimal(150000),
          unitCost: new Prisma.Decimal(90000),
          discountPercent: new Prisma.Decimal(5.0),
          effectiveCeiling: new Prisma.Decimal(10.0),
          isViolation: false,
          violationPoints: new Prisma.Decimal(0.0),
          netLinePrice: new Prisma.Decimal(142500),
          lineMarginPercent: new Prisma.Decimal(36.8),
          isRecurring: false,
          billingFrequency: BillingFrequency.ONE_TIME,
        },
      ],
      approvalRequests: salesManager
        ? [
            {
              approverId: salesManager.id,
              tierLevel: 1,
              status: ApprovalStatus.APPROVED,
              decisionReason: 'High margin multi-year software suite compliant with enterprise pricing guidelines.',
              requestedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
              decidedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
            },
          ]
        : [],
      negotiationThreads: [],
    },

    // 5.3 QT-2026-0045: Wayne Enterprises (ENTERPRISE) - IN_REVIEW
    {
      quoteNumber: 'QT-2026-0045',
      version: 1,
      customerCode: 'CUST-WAYNE',
      salesRepId: salesRep.id,
      status: QuoteStatus.IN_REVIEW,
      paymentTerms: 'Net 45',
      portalToken: 'wayne-token',
      portalTokenExpiresAt: in30Days,
      expiresAt: in14Days,
      subtotalAmount: new Prisma.Decimal(4610000),
      totalDiscountAmount: new Prisma.Decimal(989000),
      taxAmount: new Prisma.Decimal(651780),
      grandTotal: new Prisma.Decimal(4272780),
      totalCostBasis: new Prisma.Decimal(3505000),
      dealMarginPercent: new Prisma.Decimal(3.2),
      blendedRiskScore: new Prisma.Decimal(78.4),
      lines: [
        {
          sku: 'HW-LAPTOP-16',
          quantity: 50,
          unitPrice: new Prisma.Decimal(85000),
          unitCost: new Prisma.Decimal(65000),
          discountPercent: new Prisma.Decimal(22.0),
          effectiveCeiling: new Prisma.Decimal(15.0),
          isViolation: true,
          violationPoints: new Prisma.Decimal(7.0),
          netLinePrice: new Prisma.Decimal(3315000),
          lineMarginPercent: new Prisma.Decimal(1.9),
          isRecurring: false,
          billingFrequency: BillingFrequency.ONE_TIME,
        },
        {
          sku: 'SRV-DEPLOY-ONSITE',
          quantity: 3,
          unitPrice: new Prisma.Decimal(120000),
          unitCost: new Prisma.Decimal(85000),
          discountPercent: new Prisma.Decimal(15.0),
          effectiveCeiling: new Prisma.Decimal(10.0),
          isViolation: true,
          violationPoints: new Prisma.Decimal(5.0),
          netLinePrice: new Prisma.Decimal(306000),
          lineMarginPercent: new Prisma.Decimal(16.6),
          isRecurring: false,
          billingFrequency: BillingFrequency.ONE_TIME,
        },
      ],
      approvalRequests: [
        ...(salesManager
          ? [
              {
                approverId: salesManager.id,
                tierLevel: 1,
                status: ApprovalStatus.PENDING,
                decisionReason: 'Under review: Significant discount breach on 50 enterprise laptops.',
                requestedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
              },
            ]
          : []),
        ...(financeOps
          ? [
              {
                approverId: financeOps.id,
                tierLevel: 2,
                status: ApprovalStatus.PENDING,
                decisionReason: 'Finance Ops review queued due to low 3.2% margin threshold.',
                requestedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
              },
            ]
          : []),
      ],
      negotiationThreads: [],
    },

    // 5.4 QT-2026-0046: Cyberdyne Systems (SILVER) - DRAFT
    {
      quoteNumber: 'QT-2026-0046',
      version: 1,
      customerCode: 'CUST-CYBER',
      salesRepId: salesRep.id,
      status: QuoteStatus.DRAFT,
      paymentTerms: 'Net 30',
      portalToken: 'cyberdyne-token',
      portalTokenExpiresAt: in30Days,
      expiresAt: in30Days,
      subtotalAmount: new Prisma.Decimal(495000),
      totalDiscountAmount: new Prisma.Decimal(29250),
      taxAmount: new Prisma.Decimal(83835),
      grandTotal: new Prisma.Decimal(549585),
      totalCostBasis: new Prisma.Decimal(275000),
      dealMarginPercent: new Prisma.Decimal(40.9),
      blendedRiskScore: new Prisma.Decimal(8.5),
      lines: [
        {
          sku: 'HW-DOCK-01',
          quantity: 15,
          unitPrice: new Prisma.Decimal(18000),
          unitCost: new Prisma.Decimal(11000),
          discountPercent: new Prisma.Decimal(5.0),
          effectiveCeiling: new Prisma.Decimal(10.0),
          isViolation: false,
          violationPoints: new Prisma.Decimal(0.0),
          netLinePrice: new Prisma.Decimal(256500),
          lineMarginPercent: new Prisma.Decimal(35.6),
          isRecurring: false,
          billingFrequency: BillingFrequency.ONE_TIME,
        },
        {
          sku: 'SW-SEC-01',
          quantity: 5,
          unitPrice: new Prisma.Decimal(45000),
          unitCost: new Prisma.Decimal(22000),
          discountPercent: new Prisma.Decimal(7.0),
          effectiveCeiling: new Prisma.Decimal(10.0),
          isViolation: false,
          violationPoints: new Prisma.Decimal(0.0),
          netLinePrice: new Prisma.Decimal(209250),
          lineMarginPercent: new Prisma.Decimal(47.4),
          isRecurring: false,
          billingFrequency: BillingFrequency.ONE_TIME,
        },
      ],
      approvalRequests: [],
      negotiationThreads: [],
    },
  ];

  for (const q of quotationsSeed) {
    const cust = customerMap.get(q.customerCode);
    if (!cust) continue;

    // Check if quotation already exists by quoteNumber
    const existing = await prisma.quotation.findUnique({
      where: { quoteNumber: q.quoteNumber },
    });

    if (existing) {
      // Clean previous lines and related rows to re-seed cleanly
      await prisma.quotationLine.deleteMany({ where: { quotationId: existing.id } });
      await prisma.approvalRequest.deleteMany({ where: { quotationId: existing.id } });
      await prisma.customerNegotiationThread.deleteMany({ where: { quotationId: existing.id } });

      await prisma.quotation.update({
        where: { id: existing.id },
        data: {
          customerId: cust.id,
          salesRepId: q.salesRepId,
          status: q.status,
          paymentTerms: q.paymentTerms,
          subtotalAmount: q.subtotalAmount,
          totalDiscountAmount: q.totalDiscountAmount,
          taxAmount: q.taxAmount,
          grandTotal: q.grandTotal,
          totalCostBasis: q.totalCostBasis,
          dealMarginPercent: q.dealMarginPercent,
          blendedRiskScore: q.blendedRiskScore,
          portalToken: q.portalToken,
          portalTokenExpiresAt: q.portalTokenExpiresAt,
          expiresAt: q.expiresAt,
        },
      });

      // Insert lines
      for (const line of q.lines) {
        const prod = productMap.get(line.sku);
        if (!prod) continue;
        await prisma.quotationLine.create({
          data: {
            quotationId: existing.id,
            productId: prod.id,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            unitCost: line.unitCost,
            discountPercent: line.discountPercent,
            effectiveCeiling: line.effectiveCeiling,
            isViolation: line.isViolation,
            violationPoints: line.violationPoints,
            netLinePrice: line.netLinePrice,
            lineMarginPercent: line.lineMarginPercent,
            isRecurring: line.isRecurring,
            billingFrequency: line.billingFrequency,
          },
        });
      }

      // Insert approvals
      for (const app of q.approvalRequests) {
        await prisma.approvalRequest.create({
          data: {
            quotationId: existing.id,
            approverId: app.approverId,
            tierLevel: app.tierLevel,
            status: app.status,
            decisionReason: app.decisionReason,
            requestedAt: app.requestedAt,
            decidedAt: (app as any).decidedAt,
          },
        });
      }

      // Insert threads
      for (const thread of q.negotiationThreads) {
        await prisma.customerNegotiationThread.create({
          data: {
            quotationId: existing.id,
            authorRole: thread.authorRole,
            authorName: thread.authorName,
            message: thread.message,
            proposedDiscount: thread.proposedDiscount,
          },
        });
      }

      console.log(`   ✓ Updated Quotation: ${q.quoteNumber} (${cust.name}, Status: ${q.status})`);
    } else {
      const createdQuote = await prisma.quotation.create({
        data: {
          quoteNumber: q.quoteNumber,
          version: q.version,
          customerId: cust.id,
          salesRepId: q.salesRepId,
          status: q.status,
          paymentTerms: q.paymentTerms,
          subtotalAmount: q.subtotalAmount,
          totalDiscountAmount: q.totalDiscountAmount,
          taxAmount: q.taxAmount,
          grandTotal: q.grandTotal,
          totalCostBasis: q.totalCostBasis,
          dealMarginPercent: q.dealMarginPercent,
          blendedRiskScore: q.blendedRiskScore,
          portalToken: q.portalToken,
          portalTokenExpiresAt: q.portalTokenExpiresAt,
          expiresAt: q.expiresAt,
          lines: {
            create: q.lines.map((line) => {
              const prod = productMap.get(line.sku);
              return {
                productId: prod.id,
                quantity: line.quantity,
                unitPrice: line.unitPrice,
                unitCost: line.unitCost,
                discountPercent: line.discountPercent,
                effectiveCeiling: line.effectiveCeiling,
                isViolation: line.isViolation,
                violationPoints: line.violationPoints,
                netLinePrice: line.netLinePrice,
                lineMarginPercent: line.lineMarginPercent,
                isRecurring: line.isRecurring,
                billingFrequency: line.billingFrequency,
              };
            }),
          },
          approvalRequests: {
            create: q.approvalRequests.map((app) => ({
              approverId: app.approverId,
              tierLevel: app.tierLevel,
              status: app.status,
              decisionReason: app.decisionReason,
              requestedAt: app.requestedAt,
              decidedAt: (app as any).decidedAt,
            })),
          },
          negotiationThreads: {
            create: q.negotiationThreads.map((thread) => ({
              authorRole: thread.authorRole,
              authorName: thread.authorName,
              message: thread.message,
              proposedDiscount: thread.proposedDiscount,
            })),
          },
        },
      });

      console.log(`   ✓ Created Quotation: ${createdQuote.quoteNumber} (${cust.name}, Status: ${createdQuote.status})`);
    }
  }

  console.log('✅ Quotation, Customer, and Product Seeding Completed Successfully!\n');
};

if (require.main === module) {
  seedQuotationsData()
    .catch((err) => {
      console.error('❌ Quotation Seeding Failed:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
