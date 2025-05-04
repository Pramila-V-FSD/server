import express from 'express';
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  changePassword
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getUsers);

router.route('/:id')
  .get(protect, getUser)
  .put(protect, updateUser)
  .delete(protect, deleteUser);

router.route('/:id/change-password')
  .put(protect, changePassword);

export default router;