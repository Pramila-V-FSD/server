import mongoose from 'mongoose';

const passwordResetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    default: Date.now,
    expires: 3600, // 1 hour in seconds
  },
}, { timestamps: true });

const PasswordReset = mongoose.model('PasswordReset', passwordResetSchema);
export default PasswordReset;