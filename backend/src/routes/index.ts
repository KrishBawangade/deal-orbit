import { Router } from 'express';
import healthRouter from './health.route';
import authRouter from './auth.route';
import productRouter from './product.route';
import priceListRouter from './priceList.route';

const apiRouter = Router();

// Register feature routes
apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/products', productRouter);
apiRouter.use('/price-lists', priceListRouter);

export default apiRouter;
