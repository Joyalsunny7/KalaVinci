import User from '../../models/user/user.model.js';
import { validateObjectId } from '../../utils/validators.js';

export const getUserById = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const idValidation = validateObjectId(userId);
    if (!idValidation.valid) {
      throw new Error('Invalid user ID format');
    }

    const user = await User.findById(userId).lean();

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (error) {
    throw error;
  }
};

























































