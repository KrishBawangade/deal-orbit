import { Request, Response } from 'express';
import { PriceListService, priceListService } from '../services/priceList.service';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export class PriceListController {
  constructor(private readonly service: PriceListService = priceListService) {}

  public listPriceLists = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { currency, customerTier, isActive } = req.query;

    const result = await this.service.listPriceLists({
      currency: currency as string,
      customerTier: customerTier as string,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    });

    sendSuccess(res, result, 'Price lists retrieved successfully', 200);
  });

  public getPriceListById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const priceList = await this.service.getPriceListById(req.params.id);
    sendSuccess(res, priceList, 'Price list retrieved successfully', 200);
  });

  public createPriceList = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const priceList = await this.service.createPriceList(req.body);
    sendSuccess(res, priceList, 'Price list created successfully', 201);
  });

  public updatePriceList = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const priceList = await this.service.updatePriceList(req.params.id, req.body);
    sendSuccess(res, priceList, 'Price list updated successfully', 200);
  });

  public deletePriceList = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    await this.service.deletePriceList(req.params.id);
    sendSuccess(res, null, 'Price list deleted successfully', 200);
  });

  public addRule = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const rule = await this.service.addRule(req.params.id, req.body);
    sendSuccess(res, rule, 'Pricing rule added successfully', 201);
  });

  public updateRule = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const rule = await this.service.updateRule(req.params.id, req.params.ruleId, req.body);
    sendSuccess(res, rule, 'Pricing rule updated successfully', 200);
  });

  public deleteRule = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    await this.service.deleteRule(req.params.id, req.params.ruleId);
    sendSuccess(res, null, 'Pricing rule deleted successfully', 200);
  });

  public calculatePrice = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const calculation = await this.service.calculateEffectivePrice(req.body);
    sendSuccess(res, calculation, 'Price calculated successfully', 200);
  });
}

export const priceListController = new PriceListController();
