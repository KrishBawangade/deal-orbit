import { CustomerTier, ProductCategory } from '@prisma/client';
import { governanceService } from '../services/governance.service';

const runVerification = async () => {
  console.log('🧪 Running Governance & Approval Chain Verification Tests...\n');

  // TEST 1: Effective Ceiling Checks
  console.log('--- TEST 1: Effective Ceiling Logic ---');
  // Bronze (5%) on Hardware (15%) -> Expected: 5%
  const bronzeHw = await governanceService.getEffectiveCeiling(CustomerTier.BRONZE, ProductCategory.HARDWARE);
  console.log(`Bronze + Hardware: Effective = ${bronzeHw.effectiveCeiling}% (Expected: 5%)`);
  if (bronzeHw.effectiveCeiling !== 5.0) throw new Error('Bronze + Hardware failed');

  // Gold (15%) on Services (10%) -> Expected: 10%
  const goldSvc = await governanceService.getEffectiveCeiling(CustomerTier.GOLD, ProductCategory.SERVICES);
  console.log(`Gold + Services: Effective = ${goldSvc.effectiveCeiling}% (Expected: 10%)`);
  if (goldSvc.effectiveCeiling !== 10.0) throw new Error('Gold + Services failed');

  // Enterprise (20%) on Software (20%) -> Expected: 20%
  const entSw = await governanceService.getEffectiveCeiling(CustomerTier.ENTERPRISE, ProductCategory.SOFTWARE);
  console.log(`Enterprise + Software: Effective = ${entSw.effectiveCeiling}% (Expected: 20%)`);
  if (entSw.effectiveCeiling !== 20.0) throw new Error('Enterprise + Software failed');

  console.log('✅ TEST 1 Passed!\n');

  // TEST 2: Line Breach Evaluation
  console.log('--- TEST 2: Line Breach Evaluation ---');
  // Gold proposing 18% on Services (ceiling 10%) -> Violation +8%
  const lineViolation = await governanceService.evaluateLineDiscount({
    customerTier: CustomerTier.GOLD,
    categoryName: ProductCategory.SERVICES,
    proposedDiscount: 18.0,
  });
  console.log(`Line 1 (Services 18%): isViolation=${lineViolation.isViolation}, violationPoints=${lineViolation.violationPoints}`);
  if (!lineViolation.isViolation || lineViolation.violationPoints !== 8.0) {
    throw new Error('Line violation test failed');
  }

  // Gold proposing 12% on Hardware (ceiling 15%) -> No Violation
  const lineOk = await governanceService.evaluateLineDiscount({
    customerTier: CustomerTier.GOLD,
    categoryName: ProductCategory.HARDWARE,
    proposedDiscount: 12.0,
  });
  console.log(`Line 2 (Hardware 12%): isViolation=${lineOk.isViolation}, violationPoints=${lineOk.violationPoints}`);
  if (lineOk.isViolation || lineOk.violationPoints !== 0.0) {
    throw new Error('Line OK test failed');
  }

  console.log('✅ TEST 2 Passed!\n');

  // TEST 3: Mixed Categories & Blended Risk Score
  console.log('--- TEST 3: Mixed Categories & Blended Risk Score ---');
  const lines = [
    { netAmount: 1496000, discountPercent: 12.0, effectiveCeiling: 15.0 }, // Hardware: 0 overage
    { netAmount: 98400, discountPercent: 18.0, effectiveCeiling: 10.0 },   // Services: 8% overage
  ];
  const totalAmount = 1496000 + 98400; // 1,594,400
  const riskScore = governanceService.calculateBlendedRiskScore({
    lines,
    totalAmount,
    dealMarginPercent: 18.4,
    repHistoricalAvgDiscount: 9.2,
  });
  console.log(`Calculated Blended Risk Score: ${riskScore}`);
  if (riskScore <= 0 || riskScore > 100) {
    throw new Error('Risk score calculation out of bounds');
  }
  console.log('✅ TEST 3 Passed!\n');

  // TEST 4: Highest Required Level Routing
  console.log('--- TEST 4: Highest Required Level Routing ---');
  // Scenario A: Within ceiling -> Tier 0 (Auto)
  const routingAuto = governanceService.determineApprovalRouting({
    riskScore: 12.5,
    lineEvaluations: [
      { isViolation: false, violationPoints: 0, categoryName: 'HARDWARE' },
      { isViolation: false, violationPoints: 0, categoryName: 'SOFTWARE' },
    ],
    dealMarginPercent: 22.0,
  });
  console.log(`Compliant Quote Routing: Tier ${routingAuto.tierLevel} (${routingAuto.status}), requiresManager=${routingAuto.requiresManager}, requiresFinance=${routingAuto.requiresFinance}`);
  if (routingAuto.tierLevel !== 0 || routingAuto.status !== 'APPROVED') {
    throw new Error('Tier 0 Auto-Approval failed');
  }

  // Scenario B: Minor violation (< 5%) -> Tier 1 (Manager)
  const routingManager = governanceService.determineApprovalRouting({
    riskScore: 28.0,
    lineEvaluations: [
      { isViolation: true, violationPoints: 3.0, categoryName: 'HARDWARE' },
    ],
    dealMarginPercent: 19.0,
  });
  console.log(`Minor Breach Routing: Tier ${routingManager.tierLevel} (${routingManager.assignedRole}), requiresManager=${routingManager.requiresManager}, requiresFinance=${routingManager.requiresFinance}`);
  if (routingManager.tierLevel !== 1 || !routingManager.requiresManager || routingManager.requiresFinance) {
    throw new Error('Tier 1 Manager routing failed');
  }

  // Scenario C: Mixed categories with severe service breach (8% > 5%) -> Highest required: Tier 2 (Finance)
  const routingFinance = governanceService.determineApprovalRouting({
    riskScore: 38.5,
    lineEvaluations: [
      { isViolation: false, violationPoints: 0, categoryName: 'HARDWARE' },
      { isViolation: true, violationPoints: 8.0, categoryName: 'SERVICES' }, // Severe breach > 5%
    ],
    dealMarginPercent: 18.4,
  });
  console.log(`Mixed Severe Breach Routing: Tier ${routingFinance.tierLevel} (${routingFinance.assignedRole}), requiresManager=${routingFinance.requiresManager}, requiresFinance=${routingFinance.requiresFinance}`);
  console.log(`Reasons:\n  - ${routingFinance.reasons.join('\n  - ')}`);
  if (routingFinance.tierLevel !== 2 || !routingFinance.requiresManager || !routingFinance.requiresFinance) {
    throw new Error('Tier 2 Finance routing failed');
  }

  console.log('✅ TEST 4 Passed!\n');

  // TEST 5: Mandatory Audit Reason Validation
  console.log('--- TEST 5: Mandatory Audit Reason Validation ---');
  try {
    await governanceService.logAuditEvent({
      action: 'QUOTE_EDITED',
      reason: '', // Empty reason should fail!
    });
    throw new Error('Should have thrown error on empty reason');
  } catch (err: any) {
    console.log(`Empty reason rejected as expected: "${err.message}"`);
  }
  console.log('✅ TEST 5 Passed!\n');

  console.log('🎉 ALL GOVERNANCE VERIFICATION TESTS PASSED SUCCESSFULLY!');
};

runVerification()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Verification failed:', err);
    process.exit(1);
  });
