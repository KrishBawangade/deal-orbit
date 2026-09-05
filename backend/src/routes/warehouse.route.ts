import { Router } from 'express';
import { warehouseController } from '../controllers/warehouse.controller';
import { validate } from '../middlewares/validate';
import {
  createWarehouseSchema,
  updateWarehouseSchema,
  queryWarehouseSchema,
  configureStockSchema,
  batchConfigureStockSchema,
  replenishStockSchema,
} from '../validations/warehouse.validation';

const router = Router();

// ==========================================
// Warehouse Global & Alerts
// ==========================================
router.get('/replenishment-alerts', warehouseController.getReplenishmentAlerts);

// ==========================================
// Warehouse CRUD Operations
// ==========================================
router.get('/', validate(queryWarehouseSchema), warehouseController.listWarehouses);
router.post('/', validate(createWarehouseSchema), warehouseController.createWarehouse);
router.get('/:id', warehouseController.getWarehouseById);
router.put('/:id', validate(updateWarehouseSchema), warehouseController.updateWarehouse);
router.delete('/:id', warehouseController.deleteWarehouse);

// ==========================================
// Stock Levels & Replenishment Rules
// ==========================================
router.get('/:id/stock', warehouseController.getWarehouseStocks);
router.put('/:id/stock', validate(configureStockSchema), warehouseController.configureStock);
router.post('/:id/stock/batch', validate(batchConfigureStockSchema), warehouseController.batchConfigureStock);
router.post('/:id/replenish', validate(replenishStockSchema), warehouseController.replenishStock);

export default router;
