import { Request, Response } from 'express';
import { FulfillmentService, fulfillmentService } from '../services/fulfillment.service';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export class FulfillmentController {
  constructor(private readonly service: FulfillmentService = fulfillmentService) {}

  public checkFeasibility = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    let items = req.body?.items;
    if (!items && req.query.productId && req.query.quantity) {
      items = [
        {
          productId: req.query.productId as string,
          quantity: parseInt(req.query.quantity as string, 10),
        },
      ];
    }
    const result = await this.service.checkFeasibility(items || []);
    sendSuccess(res, result, 'Fulfillment feasibility evaluated successfully', 200);
  });

  public splitOrder = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await this.service.splitOrder(req.params.orderId);
    sendSuccess(res, result, 'Sales order split into fulfillment shipments successfully', 200);
  });

  public consolidateBackorder = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const warehouseId = req.body?.warehouseId;
    const result = await this.service.consolidateBackorder(req.params.id, warehouseId);
    sendSuccess(res, result, 'Remaining backorder consolidated and dispatched', 200);
  });

  public overrideSplit = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await this.service.overrideSplit(req.params.splitId, req.body);
    sendSuccess(res, result, 'Fulfillment split updated successfully', 200);
  });

  public getOrderFulfillment = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await this.service.getOrderFulfillment(req.params.orderId);
    sendSuccess(res, result, 'Order fulfillment details retrieved successfully', 200);
  });
}

export const fulfillmentController = new FulfillmentController();
