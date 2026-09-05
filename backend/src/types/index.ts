/**
 * DealOrbit Central Types Barrel Export
 * Single source of truth for all backend services, controllers, repositories, and API clients.
 */

// 1. Enums and Literal Constants
export * from './enums.types';

// 2. Common API Envelopes, Pagination & Health
export * from './common.types';

// 3. Identity, Access & Auth
export * from './auth.types';

// 4. Customer & Negotiation Profiles
export * from './customer.types';

// 5. Products, Categories, Variants & Upsell Rules
export * from './product.types';

// 6. Living Quotations & Pricing Engine
export * from './quotation.types';

// 7. Deal Strategy Simulator
export * from './simulation.types';

// 8. Governance, Discount Ceilings, Approvals & Audits
export * from './governance.types';

// 9. Restricted Customer Negotiation Portal (Masked)
export * from './portal.types';

// 10. Multi-Warehouse Fulfillment & Logistics
export * from './fulfillment.types';

// 11. Hybrid Commercial Billing, Subscriptions & Proration
export * from './billing.types';

// 12. Deal Health & Anomaly Radar
export * from './deal-health.types';

// 13. Admin Configuration & Sales Reporting
export * from './admin.types';

// 14. Price Lists & Currency / Tier Pricing
export * from './priceList.types';

// 15. Warehouse & Stock Management
export * from './warehouse.types';

