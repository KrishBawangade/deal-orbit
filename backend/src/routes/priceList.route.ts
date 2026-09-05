import { Router } from 'express';
import { priceListController } from '../controllers/priceList.controller';
import { validate } from '../middlewares/validate';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { Role } from '../types';
import {
  createPriceListSchema,
  updatePriceListSchema,
  createPriceListRuleSchema,
  updatePriceListRuleSchema,
  calculatePriceSchema,
} from '../validations/priceList.validation';

const router = Router();

// Base Authentication for all price list operations
router.use(authenticate);

// Price Calculation Engine Endpoint (All authenticated users)
router.post('/calculate', validate(calculatePriceSchema), priceListController.calculatePrice);

// Price Lists (Customer Tier & Currency Specific - Internal staff read-only)
router.get(
  '/',
  authorize(Role.SALES_REP, Role.SALES_MANAGER, Role.FINANCE_OPS, Role.ADMIN),
  priceListController.listPriceLists
);
router.post(
  '/',
  authorize(Role.ADMIN),
  validate(createPriceListSchema),
  priceListController.createPriceList
);
router.get(
  '/:id',
  authorize(Role.SALES_REP, Role.SALES_MANAGER, Role.FINANCE_OPS, Role.ADMIN),
  priceListController.getPriceListById
);
router.put(
  '/:id',
  authorize(Role.ADMIN),
  validate(updatePriceListSchema),
  priceListController.updatePriceList
);
router.delete(
  '/:id',
  authorize(Role.ADMIN),
  priceListController.deletePriceList
);

// Price List Rules (Tier/Currency overrides for Product & Variants - Admin only)
router.post(
  '/:id/rules',
  authorize(Role.ADMIN),
  validate(createPriceListRuleSchema),
  priceListController.addRule
);
router.put(
  '/:id/rules/:ruleId',
  authorize(Role.ADMIN),
  validate(updatePriceListRuleSchema),
  priceListController.updateRule
);
router.delete(
  '/:id/rules/:ruleId',
  authorize(Role.ADMIN),
  priceListController.deleteRule
);

export default router;
