import express from 'express';
const router = express.Router();
import { 
    addOrderItems,
    getMyOrders,
    getOrderById,
    updateOrderToPaid,
    createStripeCheckoutSession,
    updateOrderToPaidByStripe,
    updateOrderToDelivered,
    getOrders,
    deleteOrder
 } from '../controllers/orderController.js'; 
import { protect, admin } from '../middleware/authMiddleware.js';



router.post('/', protect, addOrderItems);                 
router.route('/')   
      .get(protect, admin, getOrders);   
      
router.route('/mine') .get(protect, getMyOrders);
router.route('/:id') .get(protect,  getOrderById).delete(protect, admin, deleteOrder);
router.route('/:id/pay') .put(protect, updateOrderToPaid);
router.route('/:id/stripe-checkout-session').post(protect, createStripeCheckoutSession);
router.route('/:id/stripe-session').put(protect, updateOrderToPaidByStripe);
router.route('/:id/deliver') .put(protect, admin, updateOrderToDelivered);
  

export default router;
