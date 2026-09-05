import { Request, Response } from 'express';
import { GovernanceService, governanceService } from '../services/governance.service';
import { WarehouseService, warehouseService } from '../services/warehouse.service';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export class AdminController {
  constructor(
    private readonly governanceSvc: GovernanceService = governanceService,
    private readonly whService: WarehouseService = warehouseService
  ) {}

  // ==========================================
  // Governance & Discount Ceilings
  // ==========================================
  public getDiscountCeilings = asyncHandler(
    async (_req: Request, res: Response): Promise<void> => {
      const result = await this.governanceSvc.getDiscountCeilingsMatrix();
      sendSuccess(res, result, 'Discount ceilings retrieved successfully', 200);
    }
  );

  public updateDiscountCeiling = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      await this.governanceSvc.updateDiscountCeiling(req.body);
      sendSuccess(res, null, 'Discount ceiling updated successfully', 200);
    }
  );

  public getApprovalChains = asyncHandler(
    async (_req: Request, res: Response): Promise<void> => {
      const result = await this.governanceSvc.getApprovalChainRules();
      sendSuccess(res, result, 'Approval chain rules retrieved successfully', 200);
    }
  );

  public updateApprovalChain = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const result = await this.governanceSvc.updateApprovalChainRule(req.body);
      sendSuccess(res, result, 'Approval chain rule updated successfully', 200);
    }
  );

  // ==========================================
  // Warehouse & Stock Management
  // ==========================================
  public getWarehouses = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { search, isActive } = req.query;
    const warehouses = await this.whService.listWarehouses({
      search: search as string,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    });
    sendSuccess(res, warehouses, 'Admin warehouses retrieved successfully', 200);
  });

  public createWarehouse = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const warehouse = await this.whService.createWarehouse(req.body);
    sendSuccess(res, warehouse, 'Warehouse created successfully', 201);
  });

  public updateWarehouseStock = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const stock = await this.whService.configureStock(req.params.id, req.body);
    sendSuccess(res, stock, 'Warehouse stock configured successfully', 200);
  });
}

export const adminController = new AdminController();
