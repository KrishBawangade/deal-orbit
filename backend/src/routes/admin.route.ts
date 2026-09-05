import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { subscriptionPlanController } from '../controllers/subscriptionPlan.controller';
import { validate } from '../middlewares/validate';
import {
  updateDiscountCeilingSchema,
  updateApprovalChainSchema,
} from '../validations/admin.validation';
import {
  createWarehouseSchema,
  queryWarehouseSchema,
  configureStockSchema,
} from '../validations/warehouse.validation';
import {
  createSubscriptionPlanSchema,
  updateSubscriptionPlanSchema,
  updateRulesSchema,
} from '../validations/subscription.validation';

const router = Router();

// ==========================================
// Discount Ceilings Configuration (API.md §4)
// ==========================================
router.get('/discount-ceilings', adminController.getDiscountCeilings);
router.put(
  '/discount-ceilings',
  validate(updateDiscountCeilingSchema),
  adminController.updateDiscountCeiling
);

// ==========================================
// Approval Chains Configuration (API.md §4)
// ==========================================
router.get('/approval-chains', adminController.getApprovalChains);
router.put(
  '/approval-chains',
  validate(updateApprovalChainSchema),
  adminController.updateApprovalChain
);

// ==========================================
// Admin Warehouse & Stock Endpoints (API.md §4)
// ==========================================
router.get('/warehouses', validate(queryWarehouseSchema), adminController.getWarehouses);
router.post('/warehouses', validate(createWarehouseSchema), adminController.createWarehouse);
router.put('/warehouses/:id/stock', validate(configureStockSchema), adminController.updateWarehouseStock);

// ==========================================
// A5) Subscription / Recurring Plan Setup
// ==========================================
router.get('/subscriptions', subscriptionPlanController.getSetupConfiguration);
router.post(
  '/subscriptions/plans',
  validate(createSubscriptionPlanSchema),
  subscriptionPlanController.createPlan
);
router.put(
  '/subscriptions/plans/:id',
  validate(updateSubscriptionPlanSchema),
  subscriptionPlanController.updatePlan
);
router.delete('/subscriptions/plans/:id', subscriptionPlanController.deletePlan);
router.put(
  '/subscriptions/rules',
  validate(updateRulesSchema),
  subscriptionPlanController.updateRules
);

export default router;

