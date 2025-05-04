import express from 'express';
import {
  requestPasswordReset,
  verifyResetToken,
  resetPassword,
} from '../controllers/authController.js';

const router = express.Router();

// Password reset routes
router.post('/forgot-password', requestPasswordReset);
router.get('/verify-reset-token', verifyResetToken);
router.post('/reset-password', resetPassword);

export default router;