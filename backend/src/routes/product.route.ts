import { Router } from 'express';
import { productController } from '../controllers/product.controller';
import { validate } from '../middlewares/validate';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { Role } from '../types';
import {
  createProductSchema,
  updateProductSchema,
  createVariantSchema,
  updateVariantSchema,
  queryProductSchema,
} from '../validations/product.validation';

const router = Router();

// Base Authentication for all product operations
router.use(authenticate);

// ==========================================
// Categories (Internal staff read-only)
// ==========================================
router.get(
  '/categories',
  authorize(Role.SALES_REP, Role.SALES_MANAGER, Role.FINANCE_OPS, Role.ADMIN),
  productController.listCategories
);

// ==========================================
// Product Catalog & General Info
// ==========================================
router.get(
  '/',
  authorize(Role.SALES_REP, Role.SALES_MANAGER, Role.FINANCE_OPS, Role.ADMIN),
  validate(queryProductSchema),
  productController.listProducts
);
router.post(
  '/',
  authorize(Role.ADMIN),
  validate(createProductSchema),
  productController.createProduct
);
router.get(
  '/:id',
  authorize(Role.SALES_REP, Role.SALES_MANAGER, Role.FINANCE_OPS, Role.ADMIN),
  productController.getProductById
);
router.put(
  '/:id',
  authorize(Role.ADMIN),
  validate(updateProductSchema),
  productController.updateProduct
);
router.delete(
  '/:id',
  authorize(Role.ADMIN),
  productController.deleteProduct
);

// ==========================================
// Product Variants (Attribute, Values, Extra Prices)
// ==========================================
router.get(
  '/:productId/variants',
  authorize(Role.SALES_REP, Role.SALES_MANAGER, Role.FINANCE_OPS, Role.ADMIN),
  productController.listVariants
);
router.post(
  '/:productId/variants',
  authorize(Role.ADMIN),
  validate(createVariantSchema),
  productController.addVariant
);
router.put(
  '/:productId/variants/:variantId',
  authorize(Role.ADMIN),
  validate(updateVariantSchema),
  productController.updateVariant
);
router.delete(
  '/:productId/variants/:variantId',
  authorize(Role.ADMIN),
  productController.deleteVariant
);

export default router;
