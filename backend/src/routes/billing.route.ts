import { Router } from 'express';
import { billingController } from '../controllers/billing.controller';
import { validate } from '../middlewares/validate';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { Role } from '../types';
import {
  modifySubscriptionSchema,
  cancelSubscriptionSchema,
} from '../validations/subscription.validation';

const router = Router();

// ==========================================
// Hybrid Orders & Subscriptions (Readable across workspace roles)
// ==========================================
router.get(
  '/orders',
  authenticate,
  authorize(Role.SALES_REP, Role.SALES_MANAGER, Role.FINANCE_OPS, Role.ADMIN),
  billingController.listOrders
);

router.get(
  '/subscriptions',
  authenticate,
  authorize(Role.SALES_REP, Role.SALES_MANAGER, Role.FINANCE_OPS, Role.ADMIN),
  billingController.listSubscriptions
);

router.get(
  '/subscriptions/:id',
  authenticate,
  authorize(Role.SALES_REP, Role.SALES_MANAGER, Role.FINANCE_OPS, Role.ADMIN),
  billingController.getSubscriptionById
);

router.get(
  '/credit-notes',
  authenticate,
  authorize(Role.SALES_REP, Role.SALES_MANAGER, Role.FINANCE_OPS, Role.ADMIN),
  billingController.listCreditNotes
);

router.get(
  '/plans',
  authenticate,
  authorize(Role.SALES_REP, Role.SALES_MANAGER, Role.FINANCE_OPS, Role.ADMIN),
  billingController.listPlans
);

// ==========================================
// Financial Modifications & Transactions (Guarded for Finance & Admin)
// ==========================================
router.post(
  '/subscriptions/:id/modify',
  authenticate,
  authorize(Role.FINANCE_OPS, Role.ADMIN),
  validate(modifySubscriptionSchema),
  billingController.modifySubscription
);

router.patch(
  '/subscriptions/:id',
  authenticate,
  authorize(Role.FINANCE_OPS, Role.ADMIN),
  billingController.updateSubscription
);

router.post(
  '/subscriptions/:id/cancel',
  authenticate,
  authorize(Role.FINANCE_OPS, Role.ADMIN),
  validate(cancelSubscriptionSchema),
  billingController.cancelSubscription
);

router.post(
  '/schedules/:id/process',
  authenticate,
  authorize(Role.FINANCE_OPS, Role.ADMIN),
  billingController.processSchedule
);

router.post(
  '/seed',
  authenticate,
  authorize(Role.FINANCE_OPS, Role.ADMIN),
  billingController.seedBilling
);

export default router;
