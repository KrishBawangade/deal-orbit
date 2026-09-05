import http from 'http';
import createApp from '../app';
import { prisma } from '../config/database';

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: any;
}

const PORT = 5099;
const BASE_URL = `http://localhost:${PORT}/api/v1`;

const request = async (
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

export const runAuthTests = async (): Promise<void> => {
  console.log('🚀 Starting Comprehensive Authentication & RBAC Test Suite...\n');

  const server = http.createServer(createApp);
  await new Promise<void>((resolve) => server.listen(PORT, resolve));

  try {
    // 1. Test Login for all 5 personas
    console.log('--- 1. Testing Login & JWT Issuance for all 5 personas ---');
    const rolesToTest = [
      { email: 'sales.rep@dealorbit.io', expectedRole: 'SALES_REP', name: 'Sarah Jenkins' },
      { email: 'sales.manager@dealorbit.io', expectedRole: 'SALES_MANAGER', name: 'Marcus Vance' },
      { email: 'finance.ops@dealorbit.io', expectedRole: 'FINANCE_OPS', name: 'Elena Rostova' },
      { email: 'admin@dealorbit.io', expectedRole: 'ADMIN', name: 'Alex Rivera' },
      { email: 'customer.acme@dealorbit.io', expectedRole: 'CUSTOMER', name: 'David Chen' },
    ];

    const tokens: Record<string, { access: string; refresh: string }> = {};

    for (const persona of rolesToTest) {
      const res = await request('/auth/login', {
        method: 'POST',
        body: { email: persona.email, password: 'DealOrbit@123' },
      });

      if (res.status !== 200 || !res.body.data?.tokens?.accessToken) {
        throw new Error(`Login failed for ${persona.email}: status ${res.status}, msg: ${res.body.message}`);
      }

      const user = res.body.data.user;
      if (user.role !== persona.expectedRole) {
        throw new Error(`Role mismatch for ${persona.email}: expected ${persona.expectedRole}, got ${user.role}`);
      }

      tokens[persona.expectedRole] = {
        access: res.body.data.tokens.accessToken,
        refresh: res.body.data.tokens.refreshToken,
      };

      console.log(`   ✓ Login success: ${persona.name} [${user.role}] -> Access Token & Refresh Token issued`);
    }

    // 2. Test GET /auth/me for identity verification
    console.log('\n--- 2. Testing Identity Extraction via GET /auth/me ---');
    for (const persona of rolesToTest) {
      const token = tokens[persona.expectedRole].access;
      const res = await request('/auth/me', { token });

      if (res.status !== 200 || res.body.data?.email !== persona.email) {
        throw new Error(`Failed /auth/me for ${persona.email}: status ${res.status}`);
      }
      console.log(`   ✓ Identity verified: ${res.body.data.email} (${res.body.data.name})`);
    }

    // 3. Test RBAC Positive Assertions (Authorized access succeeds with 200)
    console.log('\n--- 3. Testing RBAC Positive Authorization (Allowed Roles) ---');
    
    // Admin accessing admin discount ceilings
    const adminRes = await request('/admin/discount-ceilings', { token: tokens['ADMIN'].access });
    if (adminRes.status !== 200) {
      throw new Error(`ADMIN accessing /admin/discount-ceilings failed: status ${adminRes.status}`);
    }
    console.log(`   ✓ ADMIN access to /admin/discount-ceilings returned 200 OK`);

    // Finance Ops accessing billing subscriptions
    const financeRes = await request('/billing/subscriptions', { token: tokens['FINANCE_OPS'].access });
    if (financeRes.status !== 200) {
      throw new Error(`FINANCE_OPS accessing /billing/subscriptions failed: status ${financeRes.status}`);
    }
    console.log(`   ✓ FINANCE_OPS access to /billing/subscriptions returned 200 OK`);

    // Sales Rep accessing products catalog
    const salesProdRes = await request('/products', { token: tokens['SALES_REP'].access });
    if (salesProdRes.status !== 200) {
      throw new Error(`SALES_REP accessing /products failed: status ${salesProdRes.status}`);
    }
    console.log(`   ✓ SALES_REP access to /products returned 200 OK`);

    // Customer calculating price list line
    const calcRes = await request('/price-lists/calculate', {
      method: 'POST',
      token: tokens['CUSTOMER'].access,
      body: {
        productId: '00000000-0000-0000-0000-000000000000',
        customerTier: 'ENTERPRISE',
        currency: 'USD',
        quantity: 5,
      },
    });
    // Calculation endpoint reached (even if product not found, 404 means auth passed and logic handled it, not 401/403)
    if (calcRes.status === 401 || calcRes.status === 403) {
      throw new Error(`CUSTOMER calculating price blocked unexpectedly: ${calcRes.status}`);
    }
    console.log(`   ✓ CUSTOMER access to /price-lists/calculate authenticated successfully (Status: ${calcRes.status})`);

    // 4. Test RBAC Negative Assertions (Unauthorized access blocked with 401/403)
    console.log('\n--- 4. Testing RBAC Negative Authorization (Guards & Prohibitions) ---');

    // 4a. Unauthenticated request to /admin/discount-ceilings -> 401 Unauthorized
    const unauthRes = await request('/admin/discount-ceilings');
    if (unauthRes.status !== 401) {
      throw new Error(`Expected 401 for unauthenticated request, got ${unauthRes.status}`);
    }
    console.log(`   ✓ Unauthenticated request to /admin/discount-ceilings blocked with 401 Unauthorized`);

    // 4b. SALES_REP attempting /admin/discount-ceilings -> 403 Forbidden
    const repAdminRes = await request('/admin/discount-ceilings', { token: tokens['SALES_REP'].access });
    if (repAdminRes.status !== 403) {
      throw new Error(`Expected 403 for SALES_REP accessing /admin, got ${repAdminRes.status}`);
    }
    console.log(`   ✓ SALES_REP accessing /admin/discount-ceilings blocked with 403 Forbidden`);

    // 4c. CUSTOMER attempting /admin/approval-chains -> 403 Forbidden
    const custAdminRes = await request('/admin/approval-chains', { token: tokens['CUSTOMER'].access });
    if (custAdminRes.status !== 403) {
      throw new Error(`Expected 403 for CUSTOMER accessing /admin, got ${custAdminRes.status}`);
    }
    console.log(`   ✓ CUSTOMER accessing /admin/approval-chains blocked with 403 Forbidden`);

    // 4d. SALES_REP attempting /billing/subscriptions -> 403 Forbidden
    const repBillRes = await request('/billing/subscriptions', { token: tokens['SALES_REP'].access });
    if (repBillRes.status !== 403) {
      throw new Error(`Expected 403 for SALES_REP accessing /billing, got ${repBillRes.status}`);
    }
    console.log(`   ✓ SALES_REP accessing /billing/subscriptions blocked with 403 Forbidden`);

    // 4e. CUSTOMER attempting /products -> 403 Forbidden (internal catalog read is only internal staff)
    const custProdRes = await request('/products', { token: tokens['CUSTOMER'].access });
    if (custProdRes.status !== 403) {
      throw new Error(`Expected 403 for CUSTOMER accessing /products, got ${custProdRes.status}`);
    }
    console.log(`   ✓ CUSTOMER accessing /products blocked with 403 Forbidden`);

    // 5. Test Token Refresh Lifecycle
    console.log('\n--- 5. Testing Token Refresh Lifecycle ---');
    const refreshRes = await request('/auth/refresh', {
      method: 'POST',
      body: { refreshToken: tokens['SALES_REP'].refresh },
    });
    if (refreshRes.status !== 200 || !refreshRes.body.data?.accessToken) {
      throw new Error(`Token refresh failed: status ${refreshRes.status}`);
    }
    const newAccessToken = refreshRes.body.data.accessToken;
    console.log(`   ✓ Refresh token exchanged for new access token successfully`);

    // Verify new access token works
    const meWithRefreshed = await request('/auth/me', { token: newAccessToken });
    if (meWithRefreshed.status !== 200 || meWithRefreshed.body.data?.role !== 'SALES_REP') {
      throw new Error(`New access token invalid: status ${meWithRefreshed.status}`);
    }
    console.log(`   ✓ New access token verified with correct SALES_REP role claim`);

    // 6. Test Logout & Revocation
    console.log('\n--- 6. Testing Logout & Refresh Token Revocation ---');
    const logoutRes = await request('/auth/logout', {
      method: 'POST',
      body: { refreshToken: tokens['SALES_REP'].refresh },
    });
    if (logoutRes.status !== 200) {
      throw new Error(`Logout failed: status ${logoutRes.status}`);
    }
    console.log(`   ✓ Logged out successfully`);

    // Attempting to refresh again with the revoked refresh token must fail with 401
    const postLogoutRefresh = await request('/auth/refresh', {
      method: 'POST',
      body: { refreshToken: tokens['SALES_REP'].refresh },
    });
    if (postLogoutRefresh.status !== 401) {
      throw new Error(`Expected 401 after logout token revocation, got ${postLogoutRefresh.status}`);
    }
    console.log(`   ✓ Subsequent refresh attempt with revoked token rejected with 401 Unauthorized`);

    console.log('\n🎉 ALL AUTHENTICATION & RBAC INTEGRATION TESTS PASSED PERFECTLY!\n');
  } finally {
    server.close();
    await prisma.$disconnect();
  }
};

if (require.main === module) {
  runAuthTests().catch((err) => {
    console.error('❌ Integration Test Failed:', err);
    process.exit(1);
  });
}
