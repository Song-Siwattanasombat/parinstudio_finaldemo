import express from 'express';
const router = express.Router();
import { 
  authUser,
    googleAuthUser,
    verifyEmail,
    verifyAdminLogin,
    registerUser,
    forgotPassword,
    resetPassword,
    logoutUser, 
    getUserProfile,
    updateUserProfile,
    getUsers,
    getUserByID,
    deleteUser,
    updateUser
 } from '../controllers/userController.js'; 
import { protect, admin } from '../middleware/authMiddleware.js';
import { authRateLimit } from '../middleware/rateLimitMiddleware.js';



router.post('/', authRateLimit, registerUser);                 // Register
router.route('/')   
      .get(protect, admin, getUsers)            // Get all users (admin)
      
router.post('/auth', authRateLimit, authUser);                // Login (auth)
router.post('/google', googleAuthUser);         // Google login
router.post('/forgot-password', authRateLimit, forgotPassword);
router.put('/reset-password/:token', authRateLimit, resetPassword);
router.get('/verify-email/:token', verifyEmail);
router.get('/auth/verify/:token', verifyAdminLogin);
router.post('/logout', logoutUser);             // Logout
router.route('/profile')
      .get(protect, getUserProfile)
      .put(protect, updateUserProfile);         // Profile
router.route('/:id')
      .get(protect, admin, getUserByID)
      .put(protect, admin, updateUser)
      .delete(protect, admin, deleteUser);      // Admin user management


export default router;
