import { ProductCategory } from '@prisma/client';
import { productRepository, IProductFilter } from '../repositories/product.repository';
import { categoryRepository } from '../repositories/category.repository';
import { productVariantRepository } from '../repositories/productVariant.repository';
import { AppError } from '../utils/appError';

export interface ICreateProductInput {
  name: string;
  sku?: string;
  categoryId?: string;
  category?: 'HARDWARE' | 'SOFTWARE' | 'SERVICES';
  basePrice: number;
  costPrice?: number;
  unit?: string;
  taxRate?: number;
  description?: string | null;
  isPromoted?: boolean;
  minMarginThreshold?: number;
  isRecurringDefault?: boolean;
  defaultBillingCycle?: 'ONE_TIME' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  isActive?: boolean;
  variants?: Array<{
    attributeName: string;
    attributeValue: string;
    priceDelta: number;
    costDelta?: number;
    skuModifier?: string | null;
  }>;
}

export interface IUpdateProductInput {
  name?: string;
  sku?: string;
  categoryId?: string;
  category?: 'HARDWARE' | 'SOFTWARE' | 'SERVICES';
  basePrice?: number;
  costPrice?: number;
  unit?: string;
  taxRate?: number;
  description?: string | null;
  isPromoted?: boolean;
  minMarginThreshold?: number;
  isRecurringDefault?: boolean;
  defaultBillingCycle?: 'ONE_TIME' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  isActive?: boolean;
}

export interface ICreateVariantInput {
  attributeName: string;
  attributeValue: string;
  priceDelta?: number;
  costDelta?: number;
  skuModifier?: string | null;
}

export interface IUpdateVariantInput {
  attributeName?: string;
  attributeValue?: string;
  priceDelta?: number;
  costDelta?: number;
  skuModifier?: string | null;
}

export class ProductService {
  /**
   * List or seed catalog categories
   */
  public async listCategories() {
    let categories = await categoryRepository.findAll();
    if (categories.length === 0) {
      // Seed default categories from specification
      const defaults: Array<{ name: ProductCategory; description: string; defaultCeilingDiscount: number }> = [
        { name: ProductCategory.HARDWARE, description: 'Physical hardware and equipment', defaultCeilingDiscount: 15.0 },
        { name: ProductCategory.SOFTWARE, description: 'Software licenses and digital products', defaultCeilingDiscount: 20.0 },
        { name: ProductCategory.SERVICES, description: 'Professional setup, support and SLA services', defaultCeilingDiscount: 10.0 },
      ];

      for (const def of defaults) {
        await categoryRepository.create({
          name: def.name,
          description: def.description,
          defaultCeilingDiscount: def.defaultCeilingDiscount,
        });
      }
      categories = await categoryRepository.findAll();
    }
    return categories;
  }

  /**
   * Helper to resolve Category ID
   */
  private async resolveCategoryId(categoryId?: string, categoryName?: 'HARDWARE' | 'SOFTWARE' | 'SERVICES'): Promise<string> {
    if (categoryId) {
      const existing = await categoryRepository.findById(categoryId);
      if (!existing) {
        throw new AppError(`Category with ID ${categoryId} not found`, 404);
      }
      return existing.id;
    }

    if (categoryName) {
      let existing = await categoryRepository.findByName(categoryName as ProductCategory);
      if (!existing) {
        // Create it
        existing = await categoryRepository.create({
          name: categoryName as ProductCategory,
          description: `${categoryName} Category`,
          defaultCeilingDiscount: categoryName === 'HARDWARE' ? 15 : categoryName === 'SOFTWARE' ? 20 : 10,
        });
      }
      return existing.id;
    }

    // Default to HARDWARE if not specified
    let defaultCat = await categoryRepository.findByName(ProductCategory.HARDWARE);
    if (!defaultCat) {
      defaultCat = await categoryRepository.create({
        name: ProductCategory.HARDWARE,
        description: 'Physical Hardware',
        defaultCeilingDiscount: 15,
      });
    }
    return defaultCat.id;
  }

  /**
   * List products with search, category filtering, and pagination
   */
  public async listProducts(query: {
    search?: string;
    categoryId?: string;
    category?: string;
    isPromoted?: boolean;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 50));
    const skip = (page - 1) * limit;

    const filter: IProductFilter = {
      search: query.search,
      categoryId: query.categoryId,
      categoryName: query.category,
      isPromoted: query.isPromoted,
      isActive: query.isActive !== undefined ? query.isActive : true,
      skip,
      take: limit,
    };

    const { products, total } = await productRepository.findAllWithFilters(filter);

    const formattedProducts = products.map((p) => {
      const totalStock = p.warehouseStock && p.warehouseStock.length > 0
        ? p.warehouseStock.reduce((acc: number, ws: any) => acc + Math.max(0, ws.onHandQuantity - ws.reservedQuantity), 0)
        : (p.category?.name === 'HARDWARE' ? 0 : 999);

      return {
        ...p,
        totalStock,
      };
    });

    return {
      products: formattedProducts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single product with complete variants and price rules
   */
  public async getProductById(id: string) {
    const product = await productRepository.findWithDetails(id);
    if (!product) {
      throw new AppError(`Product with ID ${id} not found`, 404);
    }
    const totalStock = product.warehouseStock && product.warehouseStock.length > 0
      ? product.warehouseStock.reduce((acc: number, ws: any) => acc + Math.max(0, ws.onHandQuantity - ws.reservedQuantity), 0)
      : (product.category?.name === 'HARDWARE' ? 0 : 999);

    return {
      ...product,
      totalStock,
    };
  }

  /**
   * Create a new product with optional initial variants
   */
  public async createProduct(dto: ICreateProductInput) {
    const resolvedCatId = await this.resolveCategoryId(dto.categoryId, dto.category);

    // Generate SKU if missing
    let finalSku = dto.sku;
    if (!finalSku) {
      const prefix = dto.category ? dto.category.substring(0, 3).toUpperCase() : 'PRD';
      finalSku = `${prefix}-${Date.now().toString(36).toUpperCase()}`;
    }

    // Check SKU collision
    const existingSku = await productRepository.findBySku(finalSku);
    if (existingSku) {
      throw new AppError(`Product with SKU '${finalSku}' already exists`, 409);
    }

    const created = await productRepository.create({
      name: dto.name,
      sku: finalSku,
      category: { connect: { id: resolvedCatId } },
      basePrice: dto.basePrice,
      costPrice: dto.costPrice ?? 0,
      unit: dto.unit || 'Unit',
      taxRate: dto.taxRate !== undefined ? dto.taxRate : 18.0,
      description: dto.description || null,
      isPromoted: dto.isPromoted ?? false,
      minMarginThreshold: dto.minMarginThreshold ?? 18.0,
      isRecurringDefault: dto.isRecurringDefault ?? false,
      defaultBillingCycle: dto.defaultBillingCycle || 'ONE_TIME',
      isActive: dto.isActive ?? true,
      variants: dto.variants && dto.variants.length > 0
        ? {
            create: dto.variants.map((v) => ({
              attributeName: v.attributeName,
              attributeValue: v.attributeValue,
              priceDelta: v.priceDelta || 0,
              costDelta: v.costDelta || 0,
              skuModifier: v.skuModifier || null,
            })),
          }
        : undefined,
    });

    return created;
  }

  /**
   * Update product general info
   */
  public async updateProduct(id: string, dto: IUpdateProductInput) {
    const existing = await productRepository.findById(id);
    if (!existing) {
      throw new AppError(`Product with ID ${id} not found`, 404);
    }

    if (dto.sku && dto.sku !== existing.sku) {
      const skuCheck = await productRepository.findBySku(dto.sku);
      if (skuCheck) {
        throw new AppError(`SKU '${dto.sku}' is already in use by another product`, 409);
      }
    }

    let categoryConnect: any = undefined;
    if (dto.categoryId || dto.category) {
      const resolvedCatId = await this.resolveCategoryId(dto.categoryId, dto.category);
      categoryConnect = { connect: { id: resolvedCatId } };
    }

    const updated = await productRepository.update(id, {
      name: dto.name,
      sku: dto.sku,
      category: categoryConnect,
      basePrice: dto.basePrice,
      costPrice: dto.costPrice,
      unit: dto.unit,
      taxRate: dto.taxRate,
      description: dto.description,
      isPromoted: dto.isPromoted,
      minMarginThreshold: dto.minMarginThreshold,
      isRecurringDefault: dto.isRecurringDefault,
      defaultBillingCycle: dto.defaultBillingCycle,
      isActive: dto.isActive,
    });

    return updated;
  }

  /**
   * Delete product
   */
  public async deleteProduct(id: string) {
    const existing = await productRepository.findById(id);
    if (!existing) {
      throw new AppError(`Product with ID ${id} not found`, 404);
    }
    return productRepository.delete(id);
  }

  /**
   * List variants for a product
   */
  public async listVariants(productId: string) {
    const product = await productRepository.findById(productId);
    if (!product) {
      throw new AppError(`Product with ID ${productId} not found`, 404);
    }
    return productVariantRepository.findByProductId(productId);
  }

  /**
   * Add a variant to a product
   */
  public async addVariant(productId: string, dto: ICreateVariantInput) {
    const product = await productRepository.findById(productId);
    if (!product) {
      throw new AppError(`Product with ID ${productId} not found`, 404);
    }

    return productVariantRepository.create({
      product: { connect: { id: productId } },
      attributeName: dto.attributeName,
      attributeValue: dto.attributeValue,
      priceDelta: dto.priceDelta || 0,
      costDelta: dto.costDelta || 0,
      skuModifier: dto.skuModifier || null,
    });
  }

  /**
   * Update a variant
   */
  public async updateVariant(productId: string, variantId: string, dto: IUpdateVariantInput) {
    const variant = await productVariantRepository.findById(variantId);
    if (!variant || variant.productId !== productId) {
      throw new AppError(`Variant with ID ${variantId} not found on product ${productId}`, 404);
    }

    return productVariantRepository.update(variantId, {
      attributeName: dto.attributeName,
      attributeValue: dto.attributeValue,
      priceDelta: dto.priceDelta,
      costDelta: dto.costDelta,
      skuModifier: dto.skuModifier,
    });
  }

  /**
   * Delete a variant
   */
  public async deleteVariant(productId: string, variantId: string) {
    const variant = await productVariantRepository.findById(variantId);
    if (!variant || variant.productId !== productId) {
      throw new AppError(`Variant with ID ${variantId} not found on product ${productId}`, 404);
    }
    return productVariantRepository.delete(variantId);
  }
}

export const productService = new ProductService();
