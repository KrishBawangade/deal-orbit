import { Router } from 'express';
import { billingController } from '../controllers/billing.controller';
import { validate } from '../middlewares/validate';
import {
  modifySubscriptionSchema,
  cancelSubscriptionSchema,
} from '../validations/subscription.validation';

const router = Router();

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
