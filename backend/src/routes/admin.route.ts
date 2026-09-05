import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { validate } from '../middlewares/validate';
import {
  updateDiscountCeilingSchema,
  updateApprovalChainSchema,
} from '../validations/admin.validation';

const router = Router();

// Discount Ceilings Configuration
router.get('/discount-ceilings', adminController.getDiscountCeilings);
router.put(
  '/discount-ceilings',
  validate(updateDiscountCeilingSchema),
  adminController.updateDiscountCeiling
);

// Approval Chains Configuration
router.get('/approval-chains', adminController.getApprovalChains);
router.put(
  '/approval-chains',
  validate(updateApprovalChainSchema),
  adminController.updateApprovalChain
);

export default router;
