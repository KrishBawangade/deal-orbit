import { Request, Response } from 'express';
import { QuotationService, quotationService } from '../services/quotation.service';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { QuoteStatus } from '@prisma/client';

export class QuotationController {
  constructor(private readonly service: QuotationService = quotationService) {}

  public getQuotations = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { status, customerId, salesRepId, search, page, limit } = req.query;

    const pageNum = page ? parseInt(page as string, 10) : 1;
    const limitNum = limit ? parseInt(limit as string, 10) : 50;
    const skip = (pageNum - 1) * limitNum;

    const result = await this.service.getQuotations(
      {
        status: status as QuoteStatus,
        customerId: customerId as string,
        salesRepId: salesRepId as string,
        search: search as string,
        skip,
        take: limitNum,
      },
      req.user
    );

    sendSuccess(res, result, 'Quotations retrieved successfully', 200);
  });

  public getQuotationById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const quotation = await this.service.getQuotationById(req.params.id);
    sendSuccess(res, quotation, 'Quotation retrieved successfully', 200);
  });

  public getQuotationByPortalToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const portalQuote = await this.service.getQuotationByPortalToken(req.params.portalToken);
    sendSuccess(res, portalQuote, 'Customer portal quotation retrieved successfully', 200);
  });
}

export const quotationController = new QuotationController();
