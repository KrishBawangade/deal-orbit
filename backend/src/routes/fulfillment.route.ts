import { Router } from 'express';
import { fulfillmentController } from '../controllers/fulfillment.controller';
import { validate } from '../middlewares/validate';
import {
  checkFeasibilitySchema,
  splitOrderSchema,
  consolidateBackorderSchema,
  overrideSplitSchema,
} from '../validations/fulfillment.validation';

const router = Router();

// ==========================================
// Feasibility Check
// ==========================================
router.post('/check-feasibility', validate(checkFeasibilitySchema), fulfillmentController.checkFeasibility);
router.get('/check-feasibility', fulfillmentController.checkFeasibility);

// ==========================================
// Auto-Split Engine
// ==========================================
router.post('/split-order/:orderId', validate(splitOrderSchema), fulfillmentController.splitOrder);
router.put('/split-order/:splitId/override', validate(overrideSplitSchema), fulfillmentController.overrideSplit);

// ==========================================
// Backorders Consolidation & Order View
// ==========================================
router.post('/backorders/:id/consolidate', validate(consolidateBackorderSchema), fulfillmentController.consolidateBackorder);
router.get('/orders/:orderId', fulfillmentController.getOrderFulfillment);

export default router;
