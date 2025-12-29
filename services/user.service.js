import User from '../models/user.js';

export const getUserById = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const user = await User.findById(userId).lean()

    return user;
  } catch (error) {
    throw error;
  }
};


