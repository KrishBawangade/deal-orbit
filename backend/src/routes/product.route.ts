import { Router } from 'express';
import { productController } from '../controllers/product.controller';
import { validate } from '../middlewares/validate';
import { authenticate, optionalAuthenticate, authorize } from '../middlewares/auth.middleware';
import { Role } from '../types';
import {
  createProductSchema,
  updateProductSchema,
  createVariantSchema,
  updateVariantSchema,
  queryProductSchema,
} from '../validations/product.validation';

const router = Router();

// ==========================================
// Categories (Public & Internal Staff)
// ==========================================
router.get(
  '/categories',
  optionalAuthenticate,
  productController.listCategories
);

// ==========================================
// Product Catalog & General Info
// ==========================================
router.get(
  '/',
  optionalAuthenticate,
  validate(queryProductSchema),
  productController.listProducts
);

router.post(
  '/',
  authenticate,
  authorize(Role.ADMIN),
  validate(createProductSchema),
  productController.createProduct
);

router.get(
  '/:id',
  optionalAuthenticate,
  productController.getProductById
);

router.put(
  '/:id',
  authenticate,
  authorize(Role.ADMIN),
  validate(updateProductSchema),
  productController.updateProduct
);

router.delete(
  '/:id',
  authenticate,
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
