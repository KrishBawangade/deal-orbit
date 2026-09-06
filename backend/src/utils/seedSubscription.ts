import { Prisma, BillingFrequency, SubscriptionStatus, InvoiceType, InvoiceStatus, OrderStatus, QuoteStatus, CustomerTier, ProductCategory } from '@prisma/client';
import { prisma } from '../config/database';

export const seedSubscriptionData = async (): Promise<void> => {
  console.log('🌱 Seeding Enterprise Subscription Plans, Hybrid Contracts, Schedules & Credit Notes...');

  // 1. Ensure Categories Exist
  const hardwareCat = await prisma.category.upsert({
    where: { name: ProductCategory.HARDWARE },
    update: { defaultCeilingDiscount: 15.0 },
    create: {
      name: ProductCategory.HARDWARE,
      description: 'Physical computing hardware, enterprise laptops, docking stations',
      defaultCeilingDiscount: 15.0,
    },
  });

  const softwareCat = await prisma.category.upsert({
    where: { name: ProductCategory.SOFTWARE },
    update: { defaultCeilingDiscount: 20.0 },
    create: {
      name: ProductCategory.SOFTWARE,
      description: 'Enterprise software, licenses and security suites',
      defaultCeilingDiscount: 20.0,
    },
  });

  const servicesCat = await prisma.category.upsert({
    where: { name: ProductCategory.SERVICES },
    update: { defaultCeilingDiscount: 10.0 },
    create: {
      name: ProductCategory.SERVICES,
      description: 'Professional deployments, dedicated SLA and engineering support',
      defaultCeilingDiscount: 10.0,
    },
  });

  // 2. Seed Proration Rules
  const prorationRulesData = [
    {
      code: 'PRORATE-EXACT-DAY',
      name: 'Exact Day-Count Proration',
      description: 'Calculates exact day-count fraction ((D - d) / D) for mid-cycle upgrades, downgrades, and quantity changes.',
      prorationMethod: 'EXACT_DAY_COUNT',
      allowMidCyclePlanChange: true,
      allowMidCycleQtyChange: true,
      creditOnDowngrade: true,
      chargeImmediately: true,
      minimumRemainingDays: 1,
      isDefault: true,
    },
    {
      code: 'PRORATE-CAL-30',
      name: 'Commercial 30-Day Month Proration',
      description: 'Standardized 30-day denominator regardless of calendar month length.',
      prorationMethod: 'CALENDAR_30_DAYS',
      allowMidCyclePlanChange: true,
      allowMidCycleQtyChange: true,
      creditOnDowngrade: true,
      chargeImmediately: true,
      minimumRemainingDays: 1,
      isDefault: false,
    },
    {
      code: 'PRORATE-NONE',
      name: 'Zero Proration (Next-Period Effective)',
      description: 'Changes take effect at the start of the next billing cycle. No mid-cycle charge or credit.',
      prorationMethod: 'NONE',
      allowMidCyclePlanChange: true,
      allowMidCycleQtyChange: true,
      creditOnDowngrade: false,
      chargeImmediately: false,
      minimumRemainingDays: 0,
      isDefault: false,
    },
  ];

  const prorationMap = new Map<string, string>();
  for (const r of prorationRulesData) {
    const record = await prisma.prorationRule.upsert({
      where: { code: r.code },
      update: r,
      create: r,
    });
    prorationMap.set(r.code, record.id);
  }
  console.log('   ✓ 3 Proration Policy Rules ready');

  // 3. Seed Cancellation Rules
  const cancellationRulesData = [
    {
      code: 'CANCEL-PRORATED-CREDIT',
      name: 'Pro-Rata Unconsumed Refund with 7-Day Cooling Off',
      description: 'Immediate cancellation with pro-rata credit note for unconsumed days. 100% refund during 7-day cooling off.',
      cancellationPolicy: 'IMMEDIATE_WITH_PRORATED_REFUND',
      cancellationNoticeDays: 0,
      cancellationFeePercent: new Prisma.Decimal(0.0),
      refundMethod: 'CREDIT_NOTE',
      coolingOffPeriodDays: 7,
      minimumRemainingDays: 1,
      isDefault: true,
    },
    {
      code: 'CANCEL-EARLY-TERM-FEE',
      name: 'Enterprise Contract Termination (10% Early Termination Fee)',
      description: 'Requires 14-day notice with a 10% penalty deducted from the unconsumed balance.',
      cancellationPolicy: 'IMMEDIATE_WITH_PRORATED_REFUND',
      cancellationNoticeDays: 14,
      cancellationFeePercent: new Prisma.Decimal(10.0),
      refundMethod: 'CREDIT_NOTE',
      coolingOffPeriodDays: 3,
      minimumRemainingDays: 1,
      isDefault: false,
    },
    {
      code: 'CANCEL-NO-REFUND',
      name: 'End of Term Only (No Mid-Cycle Refund)',
      description: 'Service remains active until the end of the paid billing period. Zero mid-cycle refund issued.',
      cancellationPolicy: 'END_OF_BILLING_PERIOD',
      cancellationNoticeDays: 0,
      cancellationFeePercent: new Prisma.Decimal(0.0),
      refundMethod: 'CREDIT_NOTE',
      coolingOffPeriodDays: 0,
      minimumRemainingDays: 0,
      isDefault: false,
    },
  ];

  const cancellationMap = new Map<string, string>();
  for (const c of cancellationRulesData) {
    const record = await prisma.cancellationRule.upsert({
      where: { code: c.code },
      update: c,
      create: c,
    });
    cancellationMap.set(c.code, record.id);
  }
  console.log('   ✓ 3 Cancellation Policy Rules ready');

  // 4. Ensure Core Products Exist (Hardware, Software, Services)
  const laptopProduct = await prisma.product.upsert({
    where: { sku: 'HW-LAPTOP-16' },
    update: {
      name: 'Enterprise Pro Laptop 16" (M3 Max / 64GB / 1TB)',
      basePrice: new Prisma.Decimal(85000),
      costPrice: new Prisma.Decimal(65000),
      categoryId: hardwareCat.id,
      unit: 'Unit',
      isActive: true,
    },
    create: {
      sku: 'HW-LAPTOP-16',
      name: 'Enterprise Pro Laptop 16" (M3 Max / 64GB / 1TB)',
      basePrice: new Prisma.Decimal(85000),
      costPrice: new Prisma.Decimal(65000),
      categoryId: hardwareCat.id,
      unit: 'Unit',
      isActive: true,
    },
  });

  const deployService = await prisma.product.upsert({
    where: { sku: 'SRV-DEPLOY-ONSITE' },
    update: {
      name: 'On-Site Hardware Deployment & Provisioning',
      basePrice: new Prisma.Decimal(120000),
      costPrice: new Prisma.Decimal(45000),
      categoryId: servicesCat.id,
      unit: 'Engagement',
      isActive: true,
    },
    create: {
      sku: 'SRV-DEPLOY-ONSITE',
      name: 'On-Site Hardware Deployment & Provisioning',
      basePrice: new Prisma.Decimal(120000),
      costPrice: new Prisma.Decimal(45000),
      categoryId: servicesCat.id,
      unit: 'Engagement',
      isActive: true,
    },
  });

  const cloudProduct = await prisma.product.upsert({
    where: { sku: 'SUB-PLATFORM-ENT' },
    update: {
      name: 'DealOrbit Cloud Platform Enterprise License',
      basePrice: new Prisma.Decimal(25000),
      costPrice: new Prisma.Decimal(8000),
      categoryId: softwareCat.id,
      unit: 'Seat/Month',
      isRecurringDefault: true,
      defaultBillingCycle: BillingFrequency.MONTHLY,
      isActive: true,
    },
    create: {
      sku: 'SUB-PLATFORM-ENT',
      name: 'DealOrbit Cloud Platform Enterprise License',
      basePrice: new Prisma.Decimal(25000),
      costPrice: new Prisma.Decimal(8000),
      categoryId: softwareCat.id,
      unit: 'Seat/Month',
      isRecurringDefault: true,
      defaultBillingCycle: BillingFrequency.MONTHLY,
      isActive: true,
    },
  });

  const slaService = await prisma.product.upsert({
    where: { sku: 'SUB-SLA-24X7' },
    update: {
      name: '24/7 Dedicated Cloud Infrastructure Support Tier',
      basePrice: new Prisma.Decimal(15000),
      costPrice: new Prisma.Decimal(5000),
      categoryId: servicesCat.id,
      unit: 'Month',
      isRecurringDefault: true,
      defaultBillingCycle: BillingFrequency.MONTHLY,
      isActive: true,
    },
    create: {
      sku: 'SUB-SLA-24X7',
      name: '24/7 Dedicated Cloud Infrastructure Support Tier',
      basePrice: new Prisma.Decimal(15000),
      costPrice: new Prisma.Decimal(5000),
      categoryId: servicesCat.id,
      unit: 'Month',
      isRecurringDefault: true,
      defaultBillingCycle: BillingFrequency.MONTHLY,
      isActive: true,
    },
  });

  const dockProduct = await prisma.product.upsert({
    where: { sku: 'HW-DOCK-4K' },
    update: {
      name: 'UltraHD 4K Thunderbolt Docking Station 120W',
      basePrice: new Prisma.Decimal(18500),
      costPrice: new Prisma.Decimal(11500),
      categoryId: hardwareCat.id,
      unit: 'Unit',
      isActive: true,
    },
    create: {
      sku: 'HW-DOCK-4K',
      name: 'UltraHD 4K Thunderbolt Docking Station 120W',
      basePrice: new Prisma.Decimal(18500),
      costPrice: new Prisma.Decimal(11500),
      categoryId: hardwareCat.id,
      unit: 'Unit',
      isActive: true,
    },
  });

  const defenseAiProduct = await prisma.product.upsert({
    where: { sku: 'SUB-AI-DEFENSE' },
    update: {
      name: 'Autonomous Defense Telemetry & Threat Engine',
      basePrice: new Prisma.Decimal(45000),
      costPrice: new Prisma.Decimal(15000),
      categoryId: softwareCat.id,
      unit: 'Seat/Month',
      isRecurringDefault: true,
      defaultBillingCycle: BillingFrequency.MONTHLY,
      isActive: true,
    },
    create: {
      sku: 'SUB-AI-DEFENSE',
      name: 'Autonomous Defense Telemetry & Threat Engine',
      basePrice: new Prisma.Decimal(45000),
      costPrice: new Prisma.Decimal(15000),
      categoryId: softwareCat.id,
      unit: 'Seat/Month',
      isRecurringDefault: true,
      defaultBillingCycle: BillingFrequency.MONTHLY,
      isActive: true,
    },
  });

  const standbySlaProduct = await prisma.product.upsert({
    where: { sku: 'SUB-STANDBY-SLA' },
    update: {
      name: 'Hardware Hot-Standby Replacement SLA',
      basePrice: new Prisma.Decimal(35000),
      costPrice: new Prisma.Decimal(12000),
      categoryId: servicesCat.id,
      unit: 'Quarter',
      isRecurringDefault: true,
      defaultBillingCycle: BillingFrequency.QUARTERLY,
      isActive: true,
    },
    create: {
      sku: 'SUB-STANDBY-SLA',
      name: 'Hardware Hot-Standby Replacement SLA',
      basePrice: new Prisma.Decimal(35000),
      costPrice: new Prisma.Decimal(12000),
      categoryId: servicesCat.id,
      unit: 'Quarter',
      isRecurringDefault: true,
      defaultBillingCycle: BillingFrequency.QUARTERLY,
      isActive: true,
    },
  });

  const serverProduct = await prisma.product.upsert({
    where: { sku: 'HW-SRV-R750' },
    update: {
      name: 'Performance Server Node R750 (2U Rackmount)',
      basePrice: new Prisma.Decimal(240000),
      costPrice: new Prisma.Decimal(160000),
      categoryId: hardwareCat.id,
      unit: 'Server',
      isActive: true,
    },
    create: {
      sku: 'HW-SRV-R750',
      name: 'Performance Server Node R750 (2U Rackmount)',
      basePrice: new Prisma.Decimal(240000),
      costPrice: new Prisma.Decimal(160000),
      categoryId: hardwareCat.id,
      unit: 'Server',
      isActive: true,
    },
  });

  const neuralSaaSProduct = await prisma.product.upsert({
    where: { sku: 'SUB-NEURAL-SAAS' },
    update: {
      name: 'Neural Model Pipeline Cloud SaaS',
      basePrice: new Prisma.Decimal(60000),
      costPrice: new Prisma.Decimal(22000),
      categoryId: softwareCat.id,
      unit: 'Seat/Month',
      isRecurringDefault: true,
      defaultBillingCycle: BillingFrequency.MONTHLY,
      isActive: true,
    },
    create: {
      sku: 'SUB-NEURAL-SAAS',
      name: 'Neural Model Pipeline Cloud SaaS',
      basePrice: new Prisma.Decimal(60000),
      costPrice: new Prisma.Decimal(22000),
      categoryId: softwareCat.id,
      unit: 'Seat/Month',
      isRecurringDefault: true,
      defaultBillingCycle: BillingFrequency.MONTHLY,
      isActive: true,
    },
  });

  console.log('   ✓ Core Products verified for Hardware, Software & Recurring Services');

  // 5. Seed Subscription Plans
  const defaultProrationId = prorationMap.get('PRORATE-EXACT-DAY');
  const defaultCancellationId = cancellationMap.get('CANCEL-PRORATED-CREDIT');

  const plansData = [
    {
      code: 'PLAN-CLOUD-ENT',
      name: 'DealOrbit Cloud Platform Enterprise License',
      description: 'Full multi-tenant cloud orchestration, automated governance, and API access.',
      billingFrequency: BillingFrequency.MONTHLY,
      billingCycleDays: 30,
      planType: 'SOFTWARE_LICENSE',
      baseRecurringPrice: new Prisma.Decimal(25000.0),
      setupFee: new Prisma.Decimal(0.0),
      minCommitmentMonths: 1,
      trialDays: 14,
      isActive: true,
      productId: cloudProduct.id,
      prorationRuleId: defaultProrationId,
      cancellationRuleId: defaultCancellationId,
    },
    {
      code: 'PLAN-SLA-247',
      name: '24/7 Dedicated Cloud Infrastructure Support Tier',
      description: 'Round-the-clock priority escalation, guaranteed 15-minute response time, dedicated TAM.',
      billingFrequency: BillingFrequency.MONTHLY,
      billingCycleDays: 30,
      planType: 'SUPPORT_CONTRACT',
      baseRecurringPrice: new Prisma.Decimal(15000.0),
      setupFee: new Prisma.Decimal(0.0),
      minCommitmentMonths: 1,
      trialDays: 0,
      isActive: true,
      productId: slaService.id,
      prorationRuleId: defaultProrationId,
      cancellationRuleId: defaultCancellationId,
    },
    {
      code: 'PLAN-AI-DEFENSE',
      name: 'Autonomous Defense Telemetry & Threat Engine',
      description: 'Continuous real-time behavioral telemetry, autonomous firewall rules, and zero-day patch mitigation.',
      billingFrequency: BillingFrequency.MONTHLY,
      billingCycleDays: 30,
      planType: 'SOFTWARE_LICENSE',
      baseRecurringPrice: new Prisma.Decimal(45000.0),
      setupFee: new Prisma.Decimal(0.0),
      minCommitmentMonths: 3,
      trialDays: 0,
      isActive: true,
      productId: defenseAiProduct.id,
      prorationRuleId: defaultProrationId,
      cancellationRuleId: defaultCancellationId,
    },
    {
      code: 'PLAN-STANDBY-SLA',
      name: 'Hardware Hot-Standby Replacement SLA',
      description: 'Quarterly guaranteed on-site hardware swap within 4 hours across global DCs.',
      billingFrequency: BillingFrequency.QUARTERLY,
      billingCycleDays: 90,
      planType: 'SUPPORT_CONTRACT',
      baseRecurringPrice: new Prisma.Decimal(105000.0),
      setupFee: new Prisma.Decimal(0.0),
      minCommitmentMonths: 6,
      trialDays: 0,
      isActive: true,
      productId: standbySlaProduct.id,
      prorationRuleId: defaultProrationId,
      cancellationRuleId: defaultCancellationId,
    },
    {
      code: 'PLAN-NEURAL-SAAS',
      name: 'Neural Model Pipeline Cloud SaaS',
      description: 'Distributed training runners, quantized inference endpoint clustering, and model versioning.',
      billingFrequency: BillingFrequency.MONTHLY,
      billingCycleDays: 30,
      planType: 'SOFTWARE_LICENSE',
      baseRecurringPrice: new Prisma.Decimal(60000.0),
      setupFee: new Prisma.Decimal(0.0),
      minCommitmentMonths: 1,
      trialDays: 7,
      isActive: true,
      productId: neuralSaaSProduct.id,
      prorationRuleId: defaultProrationId,
      cancellationRuleId: defaultCancellationId,
    },
  ];

  const planMap = new Map<string, string>();
  for (const plan of plansData) {
    const record = await prisma.subscriptionPlan.upsert({
      where: { code: plan.code },
      update: plan,
      create: plan,
    });
    planMap.set(plan.code, record.id);
  }
  console.log('   ✓ 5 Enterprise Recurring Subscription Plans seeded');

  // 6. Ensure Customers
  const custAcme = await prisma.customer.upsert({
    where: { code: 'CUST-ACME' },
    update: { name: 'Acme Corp', tier: CustomerTier.GOLD, paymentTerms: 'Net 30' },
    create: {
      code: 'CUST-ACME',
      name: 'Acme Corp',
      tier: CustomerTier.GOLD,
      contactEmail: 'procurement@acmecorp.com',
      paymentTerms: 'Net 30',
    },
  });

  const custStark = await prisma.customer.upsert({
    where: { code: 'CUST-STARK' },
    update: { name: 'Stark Enterprises', tier: CustomerTier.ENTERPRISE, paymentTerms: 'Net 45' },
    create: {
      code: 'CUST-STARK',
      name: 'Stark Enterprises',
      tier: CustomerTier.ENTERPRISE,
      contactEmail: 'defense-ops@starkindustries.com',
      paymentTerms: 'Net 45',
    },
  });

  const custCyber = await prisma.customer.upsert({
    where: { code: 'CUST-CYBER' },
    update: { name: 'Cyberdyne Systems', tier: CustomerTier.SILVER, paymentTerms: 'Net 15' },
    create: {
      code: 'CUST-CYBER',
      name: 'Cyberdyne Systems',
      tier: CustomerTier.SILVER,
      contactEmail: 'neural-finance@cyberdyne.io',
      paymentTerms: 'Net 15',
    },
  });

  const salesUser = await prisma.user.findFirst({
    where: { role: 'SALES_REP' },
  }) || await prisma.user.findFirst();

  if (!salesUser) {
    throw new Error('No user found to associate quotations');
  }

  // 7. Seed Hybrid Sales Orders with One-Time Lines, Subscriptions, Invoices & Schedules
  const now = new Date();
  // Set cycle at Day 15 of 30: 15 days ago to 15 days in future
  const cycleStart = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
  const cycleEnd = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
  const nextBilling = new Date(cycleEnd);

  // -------------------------------------------------------------
  // Order 1: Acme Corp (SO-2026-0043 / SO-2026-0891)
  // -------------------------------------------------------------
  const quoteAcme = await prisma.quotation.upsert({
    where: { quoteNumber: 'QT-2026-0043' },
    update: {
      customerId: custAcme.id,
      salesRepId: salesUser.id,
      status: QuoteStatus.ACCEPTED,
      grandTotal: new Prisma.Decimal(1894400),
      paymentTerms: 'Net 30',
    },
    create: {
      quoteNumber: 'QT-2026-0043',
      customerId: custAcme.id,
      salesRepId: salesUser.id,
      status: QuoteStatus.ACCEPTED,
      grandTotal: new Prisma.Decimal(1894400),
      paymentTerms: 'Net 30',
      portalTokenExpiresAt: new Date(Date.now() + 30 * 86400000),
      expiresAt: new Date(Date.now() + 30 * 86400000),
    },
  });

  // Quotation Lines (One-time capital & services)
  await prisma.quotationLine.deleteMany({ where: { quotationId: quoteAcme.id } });
  await prisma.quotationLine.createMany({
    data: [
      {
        quotationId: quoteAcme.id,
        productId: laptopProduct.id,
        quantity: 20,
        unitPrice: new Prisma.Decimal(85000),
        unitCost: new Prisma.Decimal(65000),
        discountPercent: new Prisma.Decimal(12.0),
        effectiveCeiling: new Prisma.Decimal(15.0),
        isViolation: false,
        violationPoints: 0,
        netLinePrice: new Prisma.Decimal(1496000),
        lineMarginPercent: new Prisma.Decimal(23.5),
        isRecurring: false,
        billingFrequency: BillingFrequency.ONE_TIME,
      },
      {
        quotationId: quoteAcme.id,
        productId: deployService.id,
        quantity: 1,
        unitPrice: new Prisma.Decimal(120000),
        unitCost: new Prisma.Decimal(45000),
        discountPercent: new Prisma.Decimal(18.0),
        effectiveCeiling: new Prisma.Decimal(20.0),
        isViolation: false,
        violationPoints: 0,
        netLinePrice: new Prisma.Decimal(98400),
        lineMarginPercent: new Prisma.Decimal(54.2),
        isRecurring: false,
        billingFrequency: BillingFrequency.ONE_TIME,
      },
    ],
  });

  const soAcme = await prisma.salesOrder.upsert({
    where: { orderNumber: 'SO-2026-0043' },
    update: {
      quotationId: quoteAcme.id,
      customerId: custAcme.id,
      status: OrderStatus.PROCESSING,
      totalAmount: new Prisma.Decimal(1894400),
    },
    create: {
      orderNumber: 'SO-2026-0043',
      quotationId: quoteAcme.id,
      customerId: custAcme.id,
      status: OrderStatus.PROCESSING,
      totalAmount: new Prisma.Decimal(1894400),
    },
  });

  // Commercial Invoices for One-time lines
  await prisma.invoice.upsert({
    where: { invoiceNumber: 'INV-COMM-2026-041' },
    update: {
      salesOrderId: soAcme.id,
      customerId: custAcme.id,
      status: InvoiceStatus.PAID,
      type: InvoiceType.COMMERCIAL_INVOICE,
      subtotal: new Prisma.Decimal(1496000),
      taxAmount: new Prisma.Decimal(269280),
      totalAmount: new Prisma.Decimal(1765280),
      dueDate: new Date(Date.now() - 5 * 86400000),
      paidAt: new Date(Date.now() - 3 * 86400000),
    },
    create: {
      invoiceNumber: 'INV-COMM-2026-041',
      salesOrderId: soAcme.id,
      customerId: custAcme.id,
      status: InvoiceStatus.PAID,
      type: InvoiceType.COMMERCIAL_INVOICE,
      subtotal: new Prisma.Decimal(1496000),
      taxAmount: new Prisma.Decimal(269280),
      totalAmount: new Prisma.Decimal(1765280),
      dueDate: new Date(Date.now() - 5 * 86400000),
      paidAt: new Date(Date.now() - 3 * 86400000),
    },
  });

  await prisma.invoice.upsert({
    where: { invoiceNumber: 'INV-COMM-2026-042' },
    update: {
      salesOrderId: soAcme.id,
      customerId: custAcme.id,
      status: InvoiceStatus.PAID,
      type: InvoiceType.COMMERCIAL_INVOICE,
      subtotal: new Prisma.Decimal(98400),
      taxAmount: new Prisma.Decimal(17712),
      totalAmount: new Prisma.Decimal(116112),
      dueDate: new Date(Date.now() - 5 * 86400000),
      paidAt: new Date(Date.now() - 2 * 86400000),
    },
    create: {
      invoiceNumber: 'INV-COMM-2026-042',
      salesOrderId: soAcme.id,
      customerId: custAcme.id,
      status: InvoiceStatus.PAID,
      type: InvoiceType.COMMERCIAL_INVOICE,
      subtotal: new Prisma.Decimal(98400),
      taxAmount: new Prisma.Decimal(17712),
      totalAmount: new Prisma.Decimal(116112),
      dueDate: new Date(Date.now() - 5 * 86400000),
      paidAt: new Date(Date.now() - 2 * 86400000),
    },
  });

  // Recurring Subscriptions for Acme
  const subAcme1 = await prisma.subscription.upsert({
    where: { contractNumber: 'SUB-2026-0198' },
    update: {
      salesOrderId: soAcme.id,
      customerId: custAcme.id,
      planId: planMap.get('PLAN-CLOUD-ENT'),
      productId: cloudProduct.id,
      status: SubscriptionStatus.ACTIVE,
      billingFrequency: BillingFrequency.MONTHLY,
      recurringAmount: new Prisma.Decimal(300000.0),
      quantity: 12,
      unitPrice: new Prisma.Decimal(25000.0),
      currentPeriodStart: cycleStart,
      currentPeriodEnd: cycleEnd,
      nextBillingDate: nextBilling,
    },
    create: {
      contractNumber: 'SUB-2026-0198',
      salesOrderId: soAcme.id,
      customerId: custAcme.id,
      planId: planMap.get('PLAN-CLOUD-ENT'),
      productId: cloudProduct.id,
      status: SubscriptionStatus.ACTIVE,
      billingFrequency: BillingFrequency.MONTHLY,
      recurringAmount: new Prisma.Decimal(300000.0),
      quantity: 12,
      unitPrice: new Prisma.Decimal(25000.0),
      currentPeriodStart: cycleStart,
      currentPeriodEnd: cycleEnd,
      nextBillingDate: nextBilling,
    },
  });

  const subAcme2 = await prisma.subscription.upsert({
    where: { contractNumber: 'SUB-2026-0199' },
    update: {
      salesOrderId: soAcme.id,
      customerId: custAcme.id,
      planId: planMap.get('PLAN-SLA-247'),
      productId: slaService.id,
      status: SubscriptionStatus.ACTIVE,
      billingFrequency: BillingFrequency.MONTHLY,
      recurringAmount: new Prisma.Decimal(15000.0),
      quantity: 1,
      unitPrice: new Prisma.Decimal(15000.0),
      currentPeriodStart: cycleStart,
      currentPeriodEnd: cycleEnd,
      nextBillingDate: nextBilling,
    },
    create: {
      contractNumber: 'SUB-2026-0199',
      salesOrderId: soAcme.id,
      customerId: custAcme.id,
      planId: planMap.get('PLAN-SLA-247'),
      productId: slaService.id,
      status: SubscriptionStatus.ACTIVE,
      billingFrequency: BillingFrequency.MONTHLY,
      recurringAmount: new Prisma.Decimal(15000.0),
      quantity: 1,
      unitPrice: new Prisma.Decimal(15000.0),
      currentPeriodStart: cycleStart,
      currentPeriodEnd: cycleEnd,
      nextBillingDate: nextBilling,
    },
  });

  // Future Billing Schedules for Acme
  await prisma.billingSchedule.deleteMany({
    where: { subscriptionId: { in: [subAcme1.id, subAcme2.id] } },
  });

  // 4 monthly runs for subAcme1
  for (let i = 0; i < 4; i++) {
    const schDate = new Date(nextBilling.getTime() + i * 30 * 86400000);
    await prisma.billingSchedule.create({
      data: {
        subscriptionId: subAcme1.id,
        scheduledDate: schDate,
        amount: new Prisma.Decimal(300000.0),
        isProcessed: false,
        invoiceId: i === 0 ? 'INV-REC-2026-101' : null,
      },
    });
  }

  // 3 monthly runs for subAcme2
  for (let i = 0; i < 3; i++) {
    const schDate = new Date(nextBilling.getTime() + i * 30 * 86400000);
    await prisma.billingSchedule.create({
      data: {
        subscriptionId: subAcme2.id,
        scheduledDate: schDate,
        amount: new Prisma.Decimal(15000.0),
        isProcessed: false,
        invoiceId: i === 0 ? 'INV-REC-2026-102' : null,
      },
    });
  }

  // -------------------------------------------------------------
  // Order 2: Stark Enterprises (SO-2026-0044 / SO-2026-0892)
  // -------------------------------------------------------------
  const quoteStark = await prisma.quotation.upsert({
    where: { quoteNumber: 'QT-2026-0044' },
    update: {
      customerId: custStark.id,
      salesRepId: salesUser.id,
      status: QuoteStatus.ACCEPTED,
      grandTotal: new Prisma.Decimal(888000),
      paymentTerms: 'Net 45',
    },
    create: {
      quoteNumber: 'QT-2026-0044',
      customerId: custStark.id,
      salesRepId: salesUser.id,
      status: QuoteStatus.ACCEPTED,
      grandTotal: new Prisma.Decimal(888000),
      paymentTerms: 'Net 45',
      portalTokenExpiresAt: new Date(Date.now() + 30 * 86400000),
      expiresAt: new Date(Date.now() + 30 * 86400000),
    },
  });

  await prisma.quotationLine.deleteMany({ where: { quotationId: quoteStark.id } });
  await prisma.quotationLine.create({
    data: {
      quotationId: quoteStark.id,
      productId: dockProduct.id,
      quantity: 20,
      unitPrice: new Prisma.Decimal(18500),
      unitCost: new Prisma.Decimal(11500),
      discountPercent: new Prisma.Decimal(10.0),
      effectiveCeiling: new Prisma.Decimal(15.0),
      isViolation: false,
      violationPoints: 0,
      netLinePrice: new Prisma.Decimal(333000),
      lineMarginPercent: new Prisma.Decimal(37.8),
      isRecurring: false,
      billingFrequency: BillingFrequency.ONE_TIME,
    },
  });

  const soStark = await prisma.salesOrder.upsert({
    where: { orderNumber: 'SO-2026-0044' },
    update: {
      quotationId: quoteStark.id,
      customerId: custStark.id,
      status: OrderStatus.PENDING,
      totalAmount: new Prisma.Decimal(888000),
    },
    create: {
      orderNumber: 'SO-2026-0044',
      quotationId: quoteStark.id,
      customerId: custStark.id,
      status: OrderStatus.PENDING,
      totalAmount: new Prisma.Decimal(888000),
    },
  });

  await prisma.invoice.upsert({
    where: { invoiceNumber: 'INV-COMM-2026-039' },
    update: {
      salesOrderId: soStark.id,
      customerId: custStark.id,
      status: InvoiceStatus.PAID,
      type: InvoiceType.COMMERCIAL_INVOICE,
      subtotal: new Prisma.Decimal(333000),
      taxAmount: new Prisma.Decimal(59940),
      totalAmount: new Prisma.Decimal(392940),
      dueDate: new Date(Date.now() - 10 * 86400000),
      paidAt: new Date(Date.now() - 7 * 86400000),
    },
    create: {
      invoiceNumber: 'INV-COMM-2026-039',
      salesOrderId: soStark.id,
      customerId: custStark.id,
      status: InvoiceStatus.PAID,
      type: InvoiceType.COMMERCIAL_INVOICE,
      subtotal: new Prisma.Decimal(333000),
      taxAmount: new Prisma.Decimal(59940),
      totalAmount: new Prisma.Decimal(392940),
      dueDate: new Date(Date.now() - 10 * 86400000),
      paidAt: new Date(Date.now() - 7 * 86400000),
    },
  });

  const subStark1 = await prisma.subscription.upsert({
    where: { contractNumber: 'SUB-2026-0210' },
    update: {
      salesOrderId: soStark.id,
      customerId: custStark.id,
      planId: planMap.get('PLAN-AI-DEFENSE'),
      productId: defenseAiProduct.id,
      status: SubscriptionStatus.ACTIVE,
      billingFrequency: BillingFrequency.MONTHLY,
      recurringAmount: new Prisma.Decimal(450000.0),
      quantity: 10,
      unitPrice: new Prisma.Decimal(45000.0),
      currentPeriodStart: cycleStart,
      currentPeriodEnd: cycleEnd,
      nextBillingDate: nextBilling,
    },
    create: {
      contractNumber: 'SUB-2026-0210',
      salesOrderId: soStark.id,
      customerId: custStark.id,
      planId: planMap.get('PLAN-AI-DEFENSE'),
      productId: defenseAiProduct.id,
      status: SubscriptionStatus.ACTIVE,
      billingFrequency: BillingFrequency.MONTHLY,
      recurringAmount: new Prisma.Decimal(450000.0),
      quantity: 10,
      unitPrice: new Prisma.Decimal(45000.0),
      currentPeriodStart: cycleStart,
      currentPeriodEnd: cycleEnd,
      nextBillingDate: nextBilling,
    },
  });

  const subStark2 = await prisma.subscription.upsert({
    where: { contractNumber: 'SUB-2026-0211' },
    update: {
      salesOrderId: soStark.id,
      customerId: custStark.id,
      planId: planMap.get('PLAN-STANDBY-SLA'),
      productId: standbySlaProduct.id,
      status: SubscriptionStatus.ACTIVE,
      billingFrequency: BillingFrequency.QUARTERLY,
      recurringAmount: new Prisma.Decimal(105000.0),
      quantity: 1,
      unitPrice: new Prisma.Decimal(105000.0),
      currentPeriodStart: new Date(now.getTime() - 60 * 86400000),
      currentPeriodEnd: new Date(now.getTime() + 30 * 86400000),
      nextBillingDate: new Date(now.getTime() + 30 * 86400000),
    },
    create: {
      contractNumber: 'SUB-2026-0211',
      salesOrderId: soStark.id,
      customerId: custStark.id,
      planId: planMap.get('PLAN-STANDBY-SLA'),
      productId: standbySlaProduct.id,
      status: SubscriptionStatus.ACTIVE,
      billingFrequency: BillingFrequency.QUARTERLY,
      recurringAmount: new Prisma.Decimal(105000.0),
      quantity: 1,
      unitPrice: new Prisma.Decimal(105000.0),
      currentPeriodStart: new Date(now.getTime() - 60 * 86400000),
      currentPeriodEnd: new Date(now.getTime() + 30 * 86400000),
      nextBillingDate: new Date(now.getTime() + 30 * 86400000),
    },
  });

  await prisma.billingSchedule.deleteMany({
    where: { subscriptionId: { in: [subStark1.id, subStark2.id] } },
  });

  for (let i = 0; i < 3; i++) {
    const schDate = new Date(nextBilling.getTime() + i * 30 * 86400000);
    await prisma.billingSchedule.create({
      data: {
        subscriptionId: subStark1.id,
        scheduledDate: schDate,
        amount: new Prisma.Decimal(450000.0),
        isProcessed: false,
      },
    });
  }

  await prisma.billingSchedule.create({
    data: {
      subscriptionId: subStark2.id,
      scheduledDate: new Date(now.getTime() + 30 * 86400000),
      amount: new Prisma.Decimal(105000.0),
      isProcessed: false,
    },
  });

  // -------------------------------------------------------------
  // Order 3: Cyberdyne Systems (SO-2026-0046 / SO-2026-0893)
  // -------------------------------------------------------------
  const quoteCyber = await prisma.quotation.upsert({
    where: { quoteNumber: 'QT-2026-0046' },
    update: {
      customerId: custCyber.id,
      salesRepId: salesUser.id,
      status: QuoteStatus.ACCEPTED,
      grandTotal: new Prisma.Decimal(741600),
      paymentTerms: 'Net 15',
    },
    create: {
      quoteNumber: 'QT-2026-0046',
      customerId: custCyber.id,
      salesRepId: salesUser.id,
      status: QuoteStatus.ACCEPTED,
      grandTotal: new Prisma.Decimal(741600),
      paymentTerms: 'Net 15',
      portalTokenExpiresAt: new Date(Date.now() + 30 * 86400000),
      expiresAt: new Date(Date.now() + 30 * 86400000),
    },
  });

  await prisma.quotationLine.deleteMany({ where: { quotationId: quoteCyber.id } });
  await prisma.quotationLine.create({
    data: {
      quotationId: quoteCyber.id,
      productId: serverProduct.id,
      quantity: 2,
      unitPrice: new Prisma.Decimal(240000),
      unitCost: new Prisma.Decimal(160000),
      discountPercent: new Prisma.Decimal(8.0),
      effectiveCeiling: new Prisma.Decimal(10.0),
      isViolation: false,
      violationPoints: 0,
      netLinePrice: new Prisma.Decimal(441600),
      lineMarginPercent: new Prisma.Decimal(27.5),
      isRecurring: false,
      billingFrequency: BillingFrequency.ONE_TIME,
    },
  });

  const soCyber = await prisma.salesOrder.upsert({
    where: { orderNumber: 'SO-2026-0046' },
    update: {
      quotationId: quoteCyber.id,
      customerId: custCyber.id,
      status: OrderStatus.PENDING,
      totalAmount: new Prisma.Decimal(741600),
    },
    create: {
      orderNumber: 'SO-2026-0046',
      quotationId: quoteCyber.id,
      customerId: custCyber.id,
      status: OrderStatus.PENDING,
      totalAmount: new Prisma.Decimal(741600),
    },
  });

  await prisma.invoice.upsert({
    where: { invoiceNumber: 'INV-COMM-2026-048' },
    update: {
      salesOrderId: soCyber.id,
      customerId: custCyber.id,
      status: InvoiceStatus.SENT,
      type: InvoiceType.COMMERCIAL_INVOICE,
      subtotal: new Prisma.Decimal(441600),
      taxAmount: new Prisma.Decimal(79488),
      totalAmount: new Prisma.Decimal(521088),
      dueDate: new Date(Date.now() + 15 * 86400000),
    },
    create: {
      invoiceNumber: 'INV-COMM-2026-048',
      salesOrderId: soCyber.id,
      customerId: custCyber.id,
      status: InvoiceStatus.SENT,
      type: InvoiceType.COMMERCIAL_INVOICE,
      subtotal: new Prisma.Decimal(441600),
      taxAmount: new Prisma.Decimal(79488),
      totalAmount: new Prisma.Decimal(521088),
      dueDate: new Date(Date.now() + 15 * 86400000),
    },
  });

  const subCyber = await prisma.subscription.upsert({
    where: { contractNumber: 'SUB-2026-0230' },
    update: {
      salesOrderId: soCyber.id,
      customerId: custCyber.id,
      planId: planMap.get('PLAN-NEURAL-SAAS'),
      productId: neuralSaaSProduct.id,
      status: SubscriptionStatus.ACTIVE,
      billingFrequency: BillingFrequency.MONTHLY,
      recurringAmount: new Prisma.Decimal(300000.0),
      quantity: 5,
      unitPrice: new Prisma.Decimal(60000.0),
      currentPeriodStart: cycleStart,
      currentPeriodEnd: cycleEnd,
      nextBillingDate: nextBilling,
    },
    create: {
      contractNumber: 'SUB-2026-0230',
      salesOrderId: soCyber.id,
      customerId: custCyber.id,
      planId: planMap.get('PLAN-NEURAL-SAAS'),
      productId: neuralSaaSProduct.id,
      status: SubscriptionStatus.ACTIVE,
      billingFrequency: BillingFrequency.MONTHLY,
      recurringAmount: new Prisma.Decimal(300000.0),
      quantity: 5,
      unitPrice: new Prisma.Decimal(60000.0),
      currentPeriodStart: cycleStart,
      currentPeriodEnd: cycleEnd,
      nextBillingDate: nextBilling,
    },
  });

  await prisma.billingSchedule.deleteMany({
    where: { subscriptionId: subCyber.id },
  });

  for (let i = 0; i < 3; i++) {
    const schDate = new Date(nextBilling.getTime() + i * 30 * 86400000);
    await prisma.billingSchedule.create({
      data: {
        subscriptionId: subCyber.id,
        scheduledDate: schDate,
        amount: new Prisma.Decimal(300000.0),
        isProcessed: false,
      },
    });
  }

  // 8. Seed Historical Credit Notes
  await prisma.creditNote.upsert({
    where: { creditNoteNumber: 'CN-CANCEL-SUB-2026-0182-9021' },
    update: {
      customerId: custAcme.id,
      subscriptionId: subAcme1.id,
      amount: new Prisma.Decimal(78500.0),
      reason: 'Subscription cancellation refund (Pro-rata unconsumed 14 days)',
      createdAt: new Date(Date.now() - 9 * 86400000),
    },
    create: {
      creditNoteNumber: 'CN-CANCEL-SUB-2026-0182-9021',
      customerId: custAcme.id,
      subscriptionId: subAcme1.id,
      amount: new Prisma.Decimal(78500.0),
      reason: 'Subscription cancellation refund (Pro-rata unconsumed 14 days)',
      createdAt: new Date(Date.now() - 9 * 86400000),
    },
  });

  await prisma.creditNote.upsert({
    where: { creditNoteNumber: 'CN-MOD-SUB-2026-0175-4412' },
    update: {
      customerId: custStark.id,
      subscriptionId: subStark1.id,
      amount: new Prisma.Decimal(32000.0),
      reason: 'Mid-cycle seat reduction downgrade proration credit (16 days unconsumed)',
      createdAt: new Date(Date.now() - 17 * 86400000),
    },
    create: {
      creditNoteNumber: 'CN-MOD-SUB-2026-0175-4412',
      customerId: custStark.id,
      subscriptionId: subStark1.id,
      amount: new Prisma.Decimal(32000.0),
      reason: 'Mid-cycle seat reduction downgrade proration credit (16 days unconsumed)',
      createdAt: new Date(Date.now() - 17 * 86400000),
    },
  });

  console.log('   ✓ 3 Hybrid Orders & 2 Historical Credit Notes successfully seeded in PostgreSQL!\n');
};

if (require.main === module) {
  seedSubscriptionData()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Error seeding subscription data:', err);
      process.exit(1);
    });
}
