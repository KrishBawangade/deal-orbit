import { Router } from 'express';
import { quotationController } from '../controllers/quotation.controller';
import { approvalController } from '../controllers/approval.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate';
import { approvalDecisionSchema } from '../validations/approval.validation';
import { Role } from '@prisma/client';

const quotationRouter = Router();

// Public / Token-authenticated Customer Negotiation Portal Routes
quotationRouter.get('/portal/:portalToken', quotationController.getQuotationByPortalToken);
quotationRouter.post('/portal/:portalToken/counter-offer', quotationController.submitCounterOffer);
quotationRouter.post('/portal/:portalToken/confirm', quotationController.confirmQuotation);
quotationRouter.post('/:id/counter-offer', quotationController.submitCounterOffer);
quotationRouter.post('/:id/confirm', quotationController.confirmQuotation);

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
  '/',
  authorize(Role.SALES_REP, Role.SALES_MANAGER, Role.ADMIN),
  quotationController.createQuotation
);

quotationRouter.put(
  '/:id',
  authorize(Role.SALES_REP, Role.SALES_MANAGER, Role.ADMIN),
  quotationController.updateQuotation
);

quotationRouter.post(
  '/:id/decision',
  authorize(Role.SALES_MANAGER, Role.FINANCE_OPS, Role.ADMIN),
  validate(approvalDecisionSchema),
  approvalController.recordDecision
);

export default quotationRouter;
