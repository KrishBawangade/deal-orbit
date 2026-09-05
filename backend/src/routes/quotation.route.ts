import { Router } from 'express';
import { quotationController } from '../controllers/quotation.controller';
import { approvalController } from '../controllers/approval.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate';
import { approvalDecisionSchema } from '../validations/approval.validation';
import { Role } from '@prisma/client';

const quotationRouter = Router();

// Public / Token-authenticated Customer Negotiation Portal Route
quotationRouter.get('/portal/:portalToken', quotationController.getQuotationByPortalToken);

// Protected Internal Workspace Routes
quotationRouter.use(authenticate);

quotationRouter.get(
  '/',
  authorize(Role.SALES_REP, Role.SALES_MANAGER, Role.FINANCE_OPS, Role.ADMIN),
  quotationController.getQuotations
);

quotationRouter.get(
  '/:id',
  authorize(Role.SALES_REP, Role.SALES_MANAGER, Role.FINANCE_OPS, Role.ADMIN),
  quotationController.getQuotationById
);

quotationRouter.post(
  '/:id/decision',
  authorize(Role.SALES_MANAGER, Role.FINANCE_OPS, Role.ADMIN),
  validate(approvalDecisionSchema),
  approvalController.recordDecision
);

export default quotationRouter;
