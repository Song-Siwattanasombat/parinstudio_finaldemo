import express from 'express';
const router = express.Router();
import { getProducts, 
  getProductsById, 
  createdProduct,
  updateProduct,
  deleteProduct,
 } from '../controllers/productController.js'; 
import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/').get(getProducts).post(protect,admin, createdProduct);
router.route('/:id').get(getProductsById).put(protect, admin, updateProduct).delete(protect,admin, deleteProduct);


export default router;