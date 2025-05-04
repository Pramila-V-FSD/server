import User from '../models/User.js';
import PasswordReset from '../models/PasswordReset.js';
import { generateResetToken } from '../utils/generateToken.js';
import { sendPasswordResetEmail } from '../utils/emailSender.js';
import bcrypt from 'bcryptjs';

// Request password reset
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const token = generateResetToken();
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

    // Create or update password reset record
    await PasswordReset.findOneAndUpdate(
      { userId: user._id },
      { token, expiresAt },
      { upsert: true, new: true }
    );

    // Send email with reset link
    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${token}&id=${user._id}`;
    await sendPasswordResetEmail(email, resetLink);

    res.status(200).json({ message: 'Password reset link sent to your email' });
  } catch (error) {
    console.error('Error in requestPasswordReset:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify reset token
export const verifyResetToken = async (req, res) => {
  try {
    const { token, userId } = req.query;

    // Find the reset record
    const resetRecord = await PasswordReset.findOne({ 
      userId, 
      token 
    });

    if (!resetRecord) {
      return res.status(400).json({ message: 'Invalid or expired reset link' });
    }

    // Check if token has expired
    if (resetRecord.expiresAt < new Date()) {
      await PasswordReset.deleteOne({ _id: resetRecord._id });
      return res.status(400).json({ message: 'Reset link has expired' });
    }

    res.status(200).json({ message: 'Token is valid' });
  } catch (error) {
    console.error('Error in verifyResetToken:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reset password
export const resetPassword = async (req, res) => {
  try {
    const { userId, token, newPassword } = req.body;

    // Verify the reset token again
    const resetRecord = await PasswordReset.findOne({ 
      userId, 
      token 
    });

    if (!resetRecord) {
      return res.status(400).json({ message: 'Invalid or expired reset link' });
    }

    // Check if token has expired
    if (resetRecord.expiresAt < new Date()) {
      await PasswordReset.deleteOne({ _id: resetRecord._id });
      return res.status(400).json({ message: 'Reset link has expired' });
    }

    // Update user password
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = newPassword;
    await user.save();

    // Delete the reset record
    await PasswordReset.deleteOne({ _id: resetRecord._id });

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error in resetPassword:', error);
    res.status(500).json({ message: 'Server error' });
  }
};