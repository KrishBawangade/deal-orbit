import { Router } from 'express';
import { fulfillmentController } from '../controllers/fulfillment.controller';
import { validate } from '../middlewares/validate';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { Role } from '../types';
import {
  checkFeasibilitySchema,
  splitOrderSchema,
  consolidateBackorderSchema,
  overrideSplitSchema,
} from '../validations/fulfillment.validation';

const router = Router();

// ==========================================
// Feasibility Check (Sales Rep, Manager, Finance, Admin)
// ==========================================
router.post(
  '/check-feasibility',
  authenticate,
  authorize(Role.SALES_REP, Role.SALES_MANAGER, Role.FINANCE_OPS, Role.ADMIN),
  validate(checkFeasibilitySchema),
  fulfillmentController.checkFeasibility
);
router.get(
  '/check-feasibility',
  authenticate,
  authorize(Role.SALES_REP, Role.SALES_MANAGER, Role.FINANCE_OPS, Role.ADMIN),
  fulfillmentController.checkFeasibility
);

// ==========================================
// Auto-Split Engine (Manager, Finance, Admin)
// ==========================================
router.post(
  '/split-order/:orderId',
  authenticate,
  authorize(Role.SALES_MANAGER, Role.FINANCE_OPS, Role.ADMIN),
  validate(splitOrderSchema),
  fulfillmentController.splitOrder
);
router.put(
  '/split-order/:splitId/override',
  authenticate,
  authorize(Role.SALES_MANAGER, Role.FINANCE_OPS, Role.ADMIN),
  validate(overrideSplitSchema),
  fulfillmentController.overrideSplit
);

// ==========================================
// Backorders Consolidation & Order View
// ==========================================
router.get(
  '/orders',
  authenticate,
  authorize(Role.SALES_REP, Role.SALES_MANAGER, Role.FINANCE_OPS, Role.ADMIN),
  fulfillmentController.listOrders
);
router.post(
  '/orders/:orderId/reset',
  authenticate,
  authorize(Role.FINANCE_OPS, Role.SALES_MANAGER, Role.ADMIN),
  fulfillmentController.resetOrderFulfillment
);
router.post(
  '/backorders/:id/consolidate',
  authenticate,
  authorize(Role.SALES_REP, Role.SALES_MANAGER, Role.FINANCE_OPS, Role.ADMIN),
  validate(consolidateBackorderSchema),
  fulfillmentController.consolidateBackorder
);
router.post(
  '/orders/:orderId/consolidate',
  authenticate,
  authorize(Role.SALES_REP, Role.SALES_MANAGER, Role.FINANCE_OPS, Role.ADMIN),
  validate(consolidateBackorderSchema),
  fulfillmentController.consolidateBackorder
);
router.get(
  '/orders/:orderId',
  authenticate,
  authorize(Role.SALES_REP, Role.SALES_MANAGER, Role.FINANCE_OPS, Role.ADMIN),
  fulfillmentController.getOrderFulfillment
);
router.post(
  '/seed',
  authenticate,
  authorize(Role.SALES_REP, Role.SALES_MANAGER, Role.FINANCE_OPS, Role.ADMIN),
  fulfillmentController.seedFulfillment
);

export default router;
