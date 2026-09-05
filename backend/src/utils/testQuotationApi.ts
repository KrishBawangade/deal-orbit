import http from 'http';
import { createApp } from '../app';

const PORT = 5098;
const BASE_URL = `http://localhost:${PORT}/api/v1`;

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: any;
}

const req = async (
  path: string,
  options: {
    method?: string;
    token?: string;
    body?: any;
  } = {}
): Promise<{ status: number; body: ApiResponse }> => {
  const url = `${BASE_URL}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }

  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const body = (await res.json().catch(() => ({}))) as ApiResponse;
  return { status: res.status, body };
};

async function runTests() {
  console.log('🧪 Starting Quotation API Integration Tests...\n');

  const server = http.createServer(createApp());
  await new Promise<void>((resolve) => server.listen(PORT, resolve));

  try {
    // 1. Test Customer Portal token access (Public / no session token)
    console.log('1. Testing GET /quotations/portal/demo-token ...');
    const portalRes = await req('/quotations/portal/demo-token');
    console.log(`   Status: ${portalRes.status}`);
    if (portalRes.status !== 200 || !portalRes.body.data?.quoteNumber) {
      throw new Error(`Portal token access failed: ${JSON.stringify(portalRes.body)}`);
    }
    console.log(`   ✓ Found Portal Quote: ${portalRes.body.data.quoteNumber} for customer ${portalRes.body.data.customer.name}`);

    // 2. Test Invalid Portal Token (should 404)
    console.log('2. Testing GET /quotations/portal/invalid-token-xyz ...');
    const invalidPortalRes = await req('/quotations/portal/invalid-token-xyz');
    console.log(`   Status: ${invalidPortalRes.status}`);
    if (invalidPortalRes.status !== 404) {
      throw new Error(`Expected 404 for invalid portal token, got ${invalidPortalRes.status}`);
    }
    console.log('   ✓ Invalid token rejected with 404');

    // 3. Test Unauthenticated Access to Workspace /quotations (should 401)
    console.log('3. Testing GET /quotations without auth token ...');
    const unauthRes = await req('/quotations');
    console.log(`   Status: ${unauthRes.status}`);
    if (unauthRes.status !== 401) {
      throw new Error(`Expected 401 for unauthenticated request, got ${unauthRes.status}`);
    }
    console.log('   ✓ Unauthenticated request rejected with 401');

    // 4. Login as Sales Rep
    console.log('4. Logging in as sales.rep@dealorbit.io ...');
    const loginRes = await req('/auth/login', {
      method: 'POST',
      body: { email: 'sales.rep@dealorbit.io', password: 'DealOrbit@123' },
    });
    if (loginRes.status !== 200 || !loginRes.body.data?.tokens?.accessToken) {
      throw new Error(`Login failed: ${JSON.stringify(loginRes.body)}`);
    }
    const token = loginRes.body.data.tokens.accessToken;
    console.log('   ✓ Logged in, JWT token acquired');

    // 5. Test Authenticated GET /quotations
    console.log('5. Testing GET /quotations with JWT Bearer token ...');
    const listRes = await req('/quotations', { token });
    console.log(`   Status: ${listRes.status}`);
    if (listRes.status !== 200 || !Array.isArray(listRes.body.data?.quotations)) {
      throw new Error(`Failed to list quotations: ${JSON.stringify(listRes.body)}`);
    }
    console.log(`   ✓ Retrieved ${listRes.body.data.quotations.length} quotations!`);
    console.log(`   Stats: ${JSON.stringify(listRes.body.data.stats)}`);

    // 6. Test GET /quotations/:id
    console.log('6. Testing GET /quotations/QT-2026-0043 ...');
    const detailRes = await req('/quotations/QT-2026-0043', { token });
    console.log(`   Status: ${detailRes.status}`);
    if (detailRes.status !== 200 || detailRes.body.data?.id !== 'QT-2026-0043') {
      throw new Error(`Failed to get quotation detail: ${JSON.stringify(detailRes.body)}`);
    }
    console.log(`   ✓ Retrieved Quote Detail: ${detailRes.body.data.id} (${detailRes.body.data.customerName})`);
    console.log(`     Lines: ${detailRes.body.data.lines.length}, Threads: ${detailRes.body.data.negotiationMessages?.length}`);

    console.log('\n🎉 All Quotation API tests passed successfully!');
  } finally {
    server.close();
  }
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
