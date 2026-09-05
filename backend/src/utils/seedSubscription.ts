import { Prisma, BillingFrequency, SubscriptionStatus } from '@prisma/client';
import { prisma } from '../config/database';

export const seedSubscriptionData = async (): Promise<void> => {
  console.log('🌱 Seeding Subscription Plans, Proration Rules & Cancellation Policies...');

  // 1. Seed Proration Rules
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

  // 2. Seed Cancellation Rules
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
  console.log('   ✓ 3 Cancellation & Refund Policy Rules ready');

  // 3. Find or ensure software/services products to attach
  let softwareProduct = await prisma.product.findFirst({
    where: { category: { name: 'SOFTWARE' } },
  });

  let serviceProduct = await prisma.product.findFirst({
    where: { category: { name: 'SERVICES' } },
  });

  if (!softwareProduct || !serviceProduct) {
    const swCategory = await prisma.category.findUnique({ where: { name: 'SOFTWARE' } });
    const srvCategory = await prisma.category.findUnique({ where: { name: 'SERVICES' } });

    if (swCategory && !softwareProduct) {
      softwareProduct = await prisma.product.create({
        data: {
          sku: 'SKU-SFT-CLOUD-PRO',
          name: 'Cloud Compute & Virtual Instance Pro',
          categoryId: swCategory.id,
          basePrice: new Prisma.Decimal(25000),
          costPrice: new Prisma.Decimal(12000),
          unit: 'License',
          isRecurringDefault: true,
          defaultBillingCycle: BillingFrequency.MONTHLY,
        },
      });
    }

    if (srvCategory && !serviceProduct) {
      serviceProduct = await prisma.product.create({
        data: {
          sku: 'SKU-SRV-SLA-247',
          name: '24/7 Dedicated Enterprise SLA Support',
          categoryId: srvCategory.id,
          basePrice: new Prisma.Decimal(240000),
          costPrice: new Prisma.Decimal(90000),
          unit: 'Contract',
          isRecurringDefault: true,
          defaultBillingCycle: BillingFrequency.YEARLY,
        },
      });
    }
  }

  const defaultProrationId = prorationMap.get('PRORATE-EXACT-DAY');
  const defaultCancellationId = cancellationMap.get('CANCEL-PRORATED-CREDIT');
  const feeCancellationId = cancellationMap.get('CANCEL-EARLY-TERM-FEE');

  // 4. Seed Recurring Plans (Monthly, Quarterly, Yearly)
  const plansData = [
    {
      code: 'PLAN-CLOUD-MO',
      name: 'Pro Cloud Compute & Managed Database — Monthly',
      description: 'Monthly recurring cloud infrastructure license with automatic scaling and managed replication.',
      billingFrequency: BillingFrequency.MONTHLY,
      billingCycleDays: 30,
      planType: 'SOFTWARE_LICENSE',
      baseRecurringPrice: new Prisma.Decimal(25000.0),
      setupFee: new Prisma.Decimal(2500.0),
      minCommitmentMonths: 1,
      trialDays: 14,
      isActive: true,
      productId: softwareProduct?.id || null,
      prorationRuleId: defaultProrationId,
      cancellationRuleId: defaultCancellationId,
    },
    {
      code: 'PLAN-SEC-QTR',
      name: 'SecOps Managed Threat Radar — Quarterly',
      description: 'Quarterly continuous vulnerability scanning, threat intelligence feeds, and incident response SLA.',
      billingFrequency: BillingFrequency.QUARTERLY,
      billingCycleDays: 90,
      planType: 'SERVICES',
      baseRecurringPrice: new Prisma.Decimal(65000.0),
      setupFee: new Prisma.Decimal(0.0),
      minCommitmentMonths: 3,
      trialDays: 0,
      isActive: true,
      productId: serviceProduct?.id || null,
      prorationRuleId: defaultProrationId,
      cancellationRuleId: feeCancellationId,
    },
    {
      code: 'PLAN-SLA-YR',
      name: 'Enterprise 24/7 Dedicated SLA Support — Annual',
      description: 'Full-year premier engineering escalation, guaranteed 15-minute response times, and dedicated TAM.',
      billingFrequency: BillingFrequency.YEARLY,
      billingCycleDays: 365,
      planType: 'SUPPORT_CONTRACT',
      baseRecurringPrice: new Prisma.Decimal(240000.0),
      setupFee: new Prisma.Decimal(0.0),
      minCommitmentMonths: 12,
      trialDays: 30,
      isActive: true,
      productId: serviceProduct?.id || null,
      prorationRuleId: defaultProrationId,
      cancellationRuleId: defaultCancellationId,
    },
    {
      code: 'PLAN-DEVOPS-MO',
      name: 'DevOps Platform & Automated CI/CD Pipelines — Monthly',
      description: 'Monthly unlimited runner concurrency, container registry caching, and release governance.',
      billingFrequency: BillingFrequency.MONTHLY,
      billingCycleDays: 30,
      planType: 'SOFTWARE_LICENSE',
      baseRecurringPrice: new Prisma.Decimal(18000.0),
      setupFee: new Prisma.Decimal(0.0),
      minCommitmentMonths: 1,
      trialDays: 7,
      isActive: true,
      productId: softwareProduct?.id || null,
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
  console.log('   ✓ 4 Recurring Plans (Monthly, Quarterly, Yearly) seeded with product attachments');

  // 5. Seed sample active customer subscription for testing & demo (Acme Corp #SUB-2026-0042)
  let customer = await prisma.customer.findFirst({
    where: { name: { contains: 'Acme', mode: 'insensitive' } },
  });

  if (!customer) {
    customer = await prisma.customer.findFirst();
  }

  if (customer) {
    const monthlyPlanId = planMap.get('PLAN-CLOUD-MO');

    const now = new Date();
    // Period: 15 days ago to 15 days from now (Day 15 of 30)
    const periodStart = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
    const periodEnd = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
    const nextBilling = new Date(periodEnd);

    const sub = await prisma.subscription.upsert({
      where: { contractNumber: 'SUB-2026-0042' },
      update: {
        customerId: customer.id,
        planId: monthlyPlanId,
        productId: softwareProduct?.id || null,
        status: SubscriptionStatus.ACTIVE,
        billingFrequency: BillingFrequency.MONTHLY,
        recurringAmount: new Prisma.Decimal(30000.0),
        quantity: 1,
        unitPrice: new Prisma.Decimal(30000.0),
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        nextBillingDate: nextBilling,
      },
      create: {
        contractNumber: 'SUB-2026-0042',
        customerId: customer.id,
        planId: monthlyPlanId,
        productId: softwareProduct?.id || null,
        status: SubscriptionStatus.ACTIVE,
        billingFrequency: BillingFrequency.MONTHLY,
        recurringAmount: new Prisma.Decimal(30000.0),
        quantity: 1,
        unitPrice: new Prisma.Decimal(30000.0),
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        nextBillingDate: nextBilling,
      },
    });

    // Add 3 future scheduled billing items
    await prisma.billingSchedule.deleteMany({
      where: { subscriptionId: sub.id },
    });

    for (let i = 1; i <= 3; i++) {
      const scheduleDate = new Date(periodEnd.getTime() + (i - 1) * 30 * 24 * 60 * 60 * 1000);
      await prisma.billingSchedule.create({
        data: {
          subscriptionId: sub.id,
          scheduledDate: scheduleDate,
          amount: new Prisma.Decimal(30000.0),
          isProcessed: false,
        },
      });
    }

    console.log(`   ✓ Active Subscription ${sub.contractNumber} (₹30,000/mo, Acme Corp, Day 15/30) ready with billing schedules`);
  }

  console.log('🎉 Subscription setup seeding complete!\n');
};

if (require.main === module) {
  seedSubscriptionData()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Error seeding subscription data:', err);
      process.exit(1);
    });
}
