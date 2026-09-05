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

// Finance & Admin RBAC Guard
router.use(authenticate, authorize(Role.FINANCE_OPS, Role.ADMIN));

// Subscriptions & Hybrid Contracts
router.get('/subscriptions', billingController.listSubscriptions);
router.get('/subscriptions/:id', billingController.getSubscriptionById);
router.post(
  '/subscriptions/:id/modify',
  validate(modifySubscriptionSchema),
  billingController.modifySubscription
);
router.post(
  '/subscriptions/:id/cancel',
  validate(cancelSubscriptionSchema),
  billingController.cancelSubscription
);

// Credit Notes Ledger
router.get('/credit-notes', billingController.listCreditNotes);

export default router;
