import { Router } from 'express';
import { warehouseController } from '../controllers/warehouse.controller';
import { validate } from '../middlewares/validate';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { Role } from '../types';
import {
  createWarehouseSchema,
  updateWarehouseSchema,
  queryWarehouseSchema,
  configureStockSchema,
  batchConfigureStockSchema,
  replenishStockSchema,
} from '../validations/warehouse.validation';

const router = Router();

// Base Authentication for all warehouse operations
router.use(authenticate);

// ==========================================
// Warehouse Global & Alerts (Finance, Sales Manager, Admin)
// ==========================================
router.get(
  '/replenishment-alerts',
  authorize(Role.FINANCE_OPS, Role.SALES_MANAGER, Role.ADMIN),
  warehouseController.getReplenishmentAlerts
);

// ==========================================
// Warehouse CRUD Operations
// ==========================================
router.get(
  '/',
  authorize(Role.FINANCE_OPS, Role.SALES_MANAGER, Role.ADMIN),
  validate(queryWarehouseSchema),
  warehouseController.listWarehouses
);
router.post(
  '/',
  authorize(Role.FINANCE_OPS, Role.ADMIN),
  validate(createWarehouseSchema),
  warehouseController.createWarehouse
);
router.get(
  '/:id',
  authorize(Role.FINANCE_OPS, Role.SALES_MANAGER, Role.ADMIN),
  warehouseController.getWarehouseById
);
router.put(
  '/:id',
  authorize(Role.FINANCE_OPS, Role.ADMIN),
  validate(updateWarehouseSchema),
  warehouseController.updateWarehouse
);
router.delete(
  '/:id',
  authorize(Role.ADMIN),
  warehouseController.deleteWarehouse
);

// ==========================================
// Stock Levels & Replenishment Rules
// ==========================================
router.get(
  '/:id/stock',
  authorize(Role.FINANCE_OPS, Role.SALES_MANAGER, Role.ADMIN),
  warehouseController.getWarehouseStocks
);
router.put(
  '/:id/stock',
  authorize(Role.FINANCE_OPS, Role.ADMIN),
  validate(configureStockSchema),
  warehouseController.configureStock
);
router.post(
  '/:id/stock/batch',
  authorize(Role.FINANCE_OPS, Role.ADMIN),
  validate(batchConfigureStockSchema),
  warehouseController.batchConfigureStock
);
router.post(
  '/:id/replenish',
  authorize(Role.FINANCE_OPS, Role.ADMIN),
  validate(replenishStockSchema),
  warehouseController.replenishStock
);

export default router;
