/**
 * Deal Strategy Simulator Routes
 * Aligned with API.md §6
 */

import { Router } from 'express';
import { simulationController } from '../controllers/simulation.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';

const simulationRouter = Router();

// Internal Protected Routes
simulationRouter.use(authenticate);

simulationRouter.post(
  '/run',
  authorize(Role.SALES_REP, Role.SALES_MANAGER, Role.FINANCE_OPS, Role.ADMIN),
  simulationController.runSimulation
);

simulationRouter.post(
  '/analyze-chat',
  authorize(Role.SALES_REP, Role.SALES_MANAGER, Role.FINANCE_OPS, Role.ADMIN),
  simulationController.analyzeChat
);

simulationRouter.post(
  '/apply',
  authorize(Role.SALES_REP, Role.SALES_MANAGER, Role.ADMIN),
  simulationController.applySimulation
);

simulationRouter.post(
  '/generate-reply',
  authorize(Role.SALES_REP, Role.SALES_MANAGER, Role.FINANCE_OPS, Role.ADMIN),
  simulationController.generateReply
);

export default simulationRouter;
