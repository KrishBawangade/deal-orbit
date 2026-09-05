import { Request, Response } from 'express';
import { WarehouseService, warehouseService } from '../services/warehouse.service';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export class WarehouseController {
  constructor(private readonly service: WarehouseService = warehouseService) {}

  public listWarehouses = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { search, isActive } = req.query;
    const warehouses = await this.service.listWarehouses({
      search: search as string,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    });
    sendSuccess(res, warehouses, 'Warehouses retrieved successfully', 200);
  });

  public getWarehouseById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const warehouse = await this.service.getWarehouseById(req.params.id);
    sendSuccess(res, warehouse, 'Warehouse retrieved successfully', 200);
  });

  public createWarehouse = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const warehouse = await this.service.createWarehouse(req.body);
    sendSuccess(res, warehouse, 'Warehouse created successfully', 201);
  });

  public updateWarehouse = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const warehouse = await this.service.updateWarehouse(req.params.id, req.body);
    sendSuccess(res, warehouse, 'Warehouse updated successfully', 200);
  });

  public deleteWarehouse = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await this.service.deleteWarehouse(req.params.id);
    sendSuccess(res, null, result.message, 200);
  });

  public getWarehouseStocks = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const lowStockOnly = req.query.lowStock === 'true';
    const stocks = await this.service.getWarehouseStocks(req.params.id, lowStockOnly);
    sendSuccess(res, stocks, 'Warehouse stocks retrieved successfully', 200);
  });

  public configureStock = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const stock = await this.service.configureStock(req.params.id, req.body);
    sendSuccess(res, stock, 'Stock level and replenishment rules configured successfully', 200);
  });

  public batchConfigureStock = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const stocks = await this.service.batchConfigureStock(req.params.id, req.body.items);
    sendSuccess(res, stocks, 'Stock levels batch updated successfully', 200);
  });

  public replenishStock = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await this.service.replenishStock(req.params.id, req.body);
    sendSuccess(res, result, 'Replenishment stock received successfully', 200);
  });

  public getReplenishmentAlerts = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const alerts = await this.service.getReplenishmentAlerts();
    sendSuccess(res, alerts, 'Replenishment alerts retrieved successfully', 200);
  });
}

export const warehouseController = new WarehouseController();
