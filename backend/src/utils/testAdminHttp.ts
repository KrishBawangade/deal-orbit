import http from 'http';
import app from '../app';

const runHttpVerification = async () => {
  console.log('🌐 Running Admin REST API Integration Tests...\n');

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as any;
  const port = address.port;
  const baseUrl = `http://127.0.0.1:${port}/api/v1/admin`;

  try {
    // 1. GET /api/v1/admin/discount-ceilings
    console.log('1. Testing GET /api/v1/admin/discount-ceilings...');
    const resCeilings = await fetch(`${baseUrl}/discount-ceilings`);
    const dataCeilings = await resCeilings.json() as any;
    console.log(`   Status: ${resCeilings.status}`);
    console.log(`   Customer Tiers:`, dataCeilings.data?.customerTiers);
    console.log(`   Category Overrides:`, dataCeilings.data?.categoryOverrides);
    if (resCeilings.status !== 200 || !dataCeilings.success || !dataCeilings.data?.customerTiers) {
      throw new Error('GET /discount-ceilings failed');
    }
    console.log('   ✓ Passed!\n');

    // 2. GET /api/v1/admin/approval-chains
    console.log('2. Testing GET /api/v1/admin/approval-chains...');
    const resChains = await fetch(`${baseUrl}/approval-chains`);
    const dataChains = await resChains.json() as any;
    console.log(`   Status: ${resChains.status}`);
    console.log(`   Rules count: ${dataChains.data?.length}`);
    if (resChains.status !== 200 || !dataChains.success || !Array.isArray(dataChains.data)) {
      throw new Error('GET /approval-chains failed');
    }
    console.log('   ✓ Passed!\n');

    // 3. PUT /api/v1/admin/discount-ceilings
    console.log('3. Testing PUT /api/v1/admin/discount-ceilings...');
    const updatePayload = {
      customerTier: 'GOLD',
      categoryId: 'HARDWARE',
      maxDiscountPercent: 14.5,
    };
    const resUpdateCeiling = await fetch(`${baseUrl}/discount-ceilings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatePayload),
    });
    const dataUpdateCeiling = await resUpdateCeiling.json() as any;
    console.log(`   Status: ${resUpdateCeiling.status}`);
    console.log(`   Response:`, dataUpdateCeiling);
    if (resUpdateCeiling.status !== 200 || !dataUpdateCeiling.success) {
      throw new Error('PUT /discount-ceilings failed');
    }
    console.log('   ✓ Passed!\n');

    // 4. PUT /api/v1/admin/approval-chains
    console.log('4. Testing PUT /api/v1/admin/approval-chains...');
    const chainPayload = {
      minRiskScore: 20.01,
      maxRiskScore: 50.0,
      requiresManager: true,
      requiresFinance: false,
      description: 'Tier 1: Updated Sales Manager Approval Rule',
    };
    const resUpdateChain = await fetch(`${baseUrl}/approval-chains`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(chainPayload),
    });
    const dataUpdateChain = await resUpdateChain.json() as any;
    console.log(`   Status: ${resUpdateChain.status}`);
    console.log(`   Response:`, dataUpdateChain);
    if (resUpdateChain.status !== 200 || !dataUpdateChain.success) {
      throw new Error('PUT /approval-chains failed');
    }
    console.log('   ✓ Passed!\n');

    console.log('🎉 ALL ADMIN REST API TESTS PASSED SUCCESSFULLY!');
  } finally {
    server.close();
  }
};

runHttpVerification()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ HTTP verification failed:', err);
    process.exit(1);
  });
