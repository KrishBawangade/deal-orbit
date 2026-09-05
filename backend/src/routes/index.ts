import { Router } from 'express';
import healthRouter from './health.route';
import authRouter from './auth.route';

const apiRouter = Router();

// Register feature routes
apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);

export default apiRouter;
