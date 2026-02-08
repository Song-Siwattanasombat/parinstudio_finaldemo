import express from 'express';
const router = express.Router();
import { getProducts, 
  getProductsById, 
  createdProduct,
  updateProduct,
  deleteProduct,
  createdProductReview, 
 } from '../controllers/productController.js'; 
import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/').get(getProducts).post(protect,admin, createdProduct);
router.route('/:id').get(getProductsById).put(protect, admin, updateProduct).delete(protect,admin, deleteProduct);
router.route('/:id/reviews').post(protect, createdProductReview);

export default router;