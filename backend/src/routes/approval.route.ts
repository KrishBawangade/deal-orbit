import { Router } from 'express';
import { approvalController } from '../controllers/approval.controller';
import { optionalAuthenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate';
import { approvalDecisionSchema } from '../validations/approval.validation';

const approvalRouter = Router();

approvalRouter.use(optionalAuthenticate);

// GET /api/v1/approvals/pending (API.md §8.1)
approvalRouter.get('/pending', approvalController.getPendingApprovals);

// POST /api/v1/approvals/:id/decision (API.md §8.2)
approvalRouter.post(
  '/:id/decision',
  validate(approvalDecisionSchema),
  approvalController.recordDecision
);

export default approvalRouter;
