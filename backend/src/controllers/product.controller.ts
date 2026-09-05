import { Request, Response } from 'express';
import { ProductService, productService } from '../services/product.service';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export class ProductController {
  constructor(private readonly service: ProductService = productService) {}

  public listCategories = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const categories = await this.service.listCategories();
    sendSuccess(res, categories, 'Categories retrieved successfully', 200);
  });

  public listProducts = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { search, categoryId, category, isPromoted, isActive, page, limit } = req.query;

    const result = await this.service.listProducts({
      search: search as string,
      categoryId: categoryId as string,
      category: category as string,
      isPromoted: isPromoted !== undefined ? isPromoted === 'true' : undefined,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 20,
    });

    sendSuccess(res, result, 'Products retrieved successfully', 200);
  });

  public getProductById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const product = await this.service.getProductById(req.params.id);
    sendSuccess(res, product, 'Product retrieved successfully', 200);
  });

  public createProduct = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const product = await this.service.createProduct(req.body);
    sendSuccess(res, product, 'Product created successfully', 201);
  });

  public updateProduct = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const product = await this.service.updateProduct(req.params.id, req.body);
    sendSuccess(res, product, 'Product updated successfully', 200);
  });

  public deleteProduct = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    await this.service.deleteProduct(req.params.id);
    sendSuccess(res, null, 'Product deleted successfully', 200);
  });

  public listVariants = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const variants = await this.service.listVariants(req.params.productId);
    sendSuccess(res, variants, 'Product variants retrieved successfully', 200);
  });

  public addVariant = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const variant = await this.service.addVariant(req.params.productId, req.body);
    sendSuccess(res, variant, 'Product variant added successfully', 201);
  });

  public updateVariant = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const variant = await this.service.updateVariant(req.params.productId, req.params.variantId, req.body);
    sendSuccess(res, variant, 'Product variant updated successfully', 200);
  });

  public deleteVariant = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    await this.service.deleteVariant(req.params.productId, req.params.variantId);
    sendSuccess(res, null, 'Product variant deleted successfully', 200);
  });
}

export const productController = new ProductController();
