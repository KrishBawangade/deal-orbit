import { BillingFrequency } from '@prisma/client';
import { subscriptionPlanService } from '../services/subscriptionPlan.service';
import { prorationService } from '../services/proration.service';
import { cancellationService } from '../services/cancellation.service';
import { prisma } from '../config/database';

async function runTests() {
  console.log('🧪 ==========================================');
  console.log('🧪 A5) Subscription / Recurring Plan Test Suite');
  console.log('🧪 ==========================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, details?: any) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`, details || '');
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------
    // Test 1: Single-call Bulk Configuration Fetch
    // -------------------------------------------------------------
    console.log('▶ Test 1: Verify Bulk Setup Configuration API Data');
    const config = await subscriptionPlanService.getSetupConfiguration();
    assert(config.plans.length >= 3, 'Should return at least 3 recurring plans', config.plans.length);
    assert(
      config.plans.some((p) => p.billingFrequency === BillingFrequency.MONTHLY),
      'Should include MONTHLY frequency plan'
    );
    assert(
      config.plans.some((p) => p.billingFrequency === BillingFrequency.QUARTERLY),
      'Should include QUARTERLY frequency plan'
    );
    assert(
      config.plans.some((p) => p.billingFrequency === BillingFrequency.YEARLY),
      'Should include YEARLY frequency plan'
    );
    assert(config.prorationRules.length >= 1, 'Should include active proration rules');
    assert(config.cancellationRules.length >= 1, 'Should include active cancellation rules');
    assert(config.eligibleProducts.length >= 1, 'Should return eligible attachable products');

    // -------------------------------------------------------------
    // Test 2: Exact Day-Count Proration Math (PRD §5.2)
    // -------------------------------------------------------------
    console.log('\n▶ Test 2: Verify Exact Day-Count Proration Formula ((D - d)/D) * (RateNew - RateOld)');
    // Scenario: Upgrading ₹30,000/mo to ₹45,000/mo on Day 15 of a 30-day month
    const start = new Date('2026-09-01T00:00:00Z');
    const end = new Date('2026-10-01T00:00:00Z'); // 30 days
    const effective = new Date('2026-09-16T00:00:00Z'); // Day 15, 15 days remaining

    const upgradeProration = prorationService.calculateProrationDelta({
      currentPeriodStart: start,
      currentPeriodEnd: end,
      effectiveDate: effective,
      previousRate: 30000,
      newRate: 45000,
      prorationMethod: 'EXACT_DAY_COUNT',
    });

    console.log('   Proration Breakdown:', upgradeProration);
    assert(upgradeProration.daysInPeriod === 30, 'Total period days D should be 30');
    assert(upgradeProration.daysRemaining === 15, 'Days remaining D - d should be 15');
    assert(upgradeProration.prorationFraction === 0.5, 'Proration fraction should be 0.5000');
    assert(upgradeProration.rateDelta === 15000, 'Rate delta should be +15000');
    assert(upgradeProration.proratedChargeAmount === 7500, 'Prorated charge should be ₹7,500.00');
    assert(upgradeProration.isCredit === false, 'Should be an invoice charge, not a credit');

    // -------------------------------------------------------------
    // Test 3: Mid-Cycle Quantity Expansion Proration
    // -------------------------------------------------------------
    console.log('\n▶ Test 3: Verify Mid-Cycle Quantity Expansion Proration');
    // Scenario: 10 seats at ₹2,000/seat (₹20,000) increased to 15 seats (₹30,000) with 12 days remaining out of 30
    const qtyEffective = new Date('2026-09-19T00:00:00Z'); // 12 days remaining
    const qtyProration = prorationService.calculateProrationDelta({
      currentPeriodStart: start,
      currentPeriodEnd: end,
      effectiveDate: qtyEffective,
      previousRate: 20000,
      newRate: 30000,
    });

    // 12/30 = 0.40; 0.40 * 10,000 = 4,000
    assert(qtyProration.daysRemaining === 12, 'Days remaining should be 12');
    assert(qtyProration.prorationFraction === 0.4, 'Proration fraction should be 0.4000');
    assert(qtyProration.proratedChargeAmount === 4000, 'Prorated expansion charge should be ₹4,000.00');

    // -------------------------------------------------------------
    // Test 4: Mid-Cycle Downgrade (Credit Note Generation Math)
    // -------------------------------------------------------------
    console.log('\n▶ Test 4: Verify Mid-Cycle Downgrade Credit Note Math');
    // Scenario: Downgrade from ₹40,000 to ₹25,000 on Day 20 (10 days remaining of 30)
    const downgradeEffective = new Date('2026-09-21T00:00:00Z'); // 10 days remaining
    const downgradeProration = prorationService.calculateProrationDelta({
      currentPeriodStart: start,
      currentPeriodEnd: end,
      effectiveDate: downgradeEffective,
      previousRate: 40000,
      newRate: 25000,
    });

    // 10/30 = 0.3333; 0.3333 * 15,000 = 5,000
    assert(downgradeProration.isCredit === true, 'isCredit should be true on downgrade');
    assert(downgradeProration.rateDelta === -15000, 'Rate delta should be -15000');
    assert(Math.abs(downgradeProration.proratedChargeAmount - 5000) < 0.1, 'Credit amount should be ~₹5,000.00');

    // -------------------------------------------------------------
    // Test 5: Dynamic Recurring Plan Creation & Product Attachment
    // -------------------------------------------------------------
    console.log('\n▶ Test 5: Create Recurring Plan and Attach to Product');
    const testSku = config.eligibleProducts[0]?.id;
    const testCode = `PLAN-TEST-${Date.now().toString().slice(-4)}`;

    const newPlan = await subscriptionPlanService.createPlan({
      name: 'Managed Security Shield Quarterly',
      code: testCode,
      description: 'Quarterly security vulnerability SLA',
      billingFrequency: BillingFrequency.QUARTERLY,
      billingCycleDays: 90,
      baseRecurringPrice: 48000,
      setupFee: 1500,
      minCommitmentMonths: 3,
      productId: testSku,
    });

    assert(newPlan.code === testCode, 'New plan should have unique code');
    assert(newPlan.billingFrequency === BillingFrequency.QUARTERLY, 'Frequency should be QUARTERLY');
    assert(newPlan.billingCycleDays === 90, 'Billing cycle days should be 90');
    assert(Number(newPlan.baseRecurringPrice) === 48000, 'Price should be 48000');
    assert(newPlan.productId === testSku, 'Plan should be attached to product');

    // Clean up created test plan
    await subscriptionPlanService.deletePlan(newPlan.id);
    console.log('   ✓ Cleaned up test plan');

    // -------------------------------------------------------------
    // Summary
    // -------------------------------------------------------------
    console.log('\n==========================================');
    console.log(`🏁 Test Results: ${passed} Passed, ${failed} Failed`);
    console.log('==========================================\n');

    if (failed > 0) process.exit(1);
  } catch (error) {
    console.error('Fatal test error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
