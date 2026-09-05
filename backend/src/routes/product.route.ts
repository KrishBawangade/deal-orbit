import { Router } from 'express';
import { productController } from '../controllers/product.controller';
import { validate } from '../middlewares/validate';
import {
  createProductSchema,
  updateProductSchema,
  createVariantSchema,
  updateVariantSchema,
  queryProductSchema,
} from '../validations/product.validation';

const router = Router();

// ==========================================
// Categories
// ==========================================
router.get('/categories', productController.listCategories);

// ==========================================
// Product Catalog & General Info
// ==========================================
router.get('/', validate(queryProductSchema), productController.listProducts);
router.post('/', validate(createProductSchema), productController.createProduct);
router.get('/:id', productController.getProductById);
router.put('/:id', validate(updateProductSchema), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

// ==========================================
// Product Variants (Attribute, Values, Extra Prices)
// ==========================================
router.get('/:productId/variants', productController.listVariants);
router.post('/:productId/variants', validate(createVariantSchema), productController.addVariant);
router.put('/:productId/variants/:variantId', validate(updateVariantSchema), productController.updateVariant);
router.delete('/:productId/variants/:variantId', productController.deleteVariant);

export default router;
