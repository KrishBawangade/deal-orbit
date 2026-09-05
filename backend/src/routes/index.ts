import { Router } from 'express';
import healthRouter from './health.route';
import authRouter from './auth.route';
import productRouter from './product.route';
import priceListRouter from './priceList.route';
import warehouseRouter from './warehouse.route';
import fulfillmentRouter from './fulfillment.route';
import adminRouter from './admin.route';
import billingRouter from './billing.route';
import quotationRouter from './quotation.route';

const apiRouter = Router();

// Register feature routes
apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/products', productRouter);
apiRouter.use('/price-lists', priceListRouter);
apiRouter.use('/warehouses', warehouseRouter);
apiRouter.use('/fulfillment', fulfillmentRouter);
apiRouter.use('/admin', adminRouter);
apiRouter.use('/billing', billingRouter);
apiRouter.use('/quotations', quotationRouter);

export default apiRouter;
