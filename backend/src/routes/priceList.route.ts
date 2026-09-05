import { Router } from 'express';
import { priceListController } from '../controllers/priceList.controller';
import { validate } from '../middlewares/validate';
import {
  createPriceListSchema,
  updatePriceListSchema,
  createPriceListRuleSchema,
  updatePriceListRuleSchema,
  calculatePriceSchema,
} from '../validations/priceList.validation';

const router = Router();

// Price Calculation Engine Endpoint
router.post('/calculate', validate(calculatePriceSchema), priceListController.calculatePrice);

// Price Lists (Customer Tier & Currency Specific)
router.get('/', priceListController.listPriceLists);
router.post('/', validate(createPriceListSchema), priceListController.createPriceList);
router.get('/:id', priceListController.getPriceListById);
router.put('/:id', validate(updatePriceListSchema), priceListController.updatePriceList);
router.delete('/:id', priceListController.deletePriceList);

// Price List Rules (Tier/Currency overrides for Product & Variants)
router.post('/:id/rules', validate(createPriceListRuleSchema), priceListController.addRule);
router.put('/:id/rules/:ruleId', validate(updatePriceListRuleSchema), priceListController.updateRule);
router.delete('/:id/rules/:ruleId', priceListController.deleteRule);

export default router;
