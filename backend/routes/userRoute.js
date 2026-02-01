import express from 'express';
const router = express.Router();
import { 
  authUser,
    registerUser,
    logoutUser, 
    getUserProfile,
    updateUserProfile,
    getUsers,
    getUserByID,
    deleteUser,
    updateUser
 } from '../controllers/userController.js'; 
import { protect, admin } from '../middleware/authMiddleware.js';



router.post('/', registerUser);                 // Register
router.route('/')   
      .get(protect, admin, getUsers)            // Get all users (admin)
      
router.post('/auth', authUser);                // Login (auth)
router.post('/logout', logoutUser);             // Logout
router.route('/profile')
      .get(protect, getUserProfile)
      .put(protect, updateUserProfile);         // Profile
router.route('/:id')
      .get(protect, admin, getUserByID)
      .put(protect, admin, updateUser)
      .delete(protect, admin, deleteUser);      // Admin user management


export default router;