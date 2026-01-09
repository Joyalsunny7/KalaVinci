import User from "../../models/user/user.model.js";
import bcrypt from "bcryptjs";
import { validateEmail, validateObjectId } from "../../utils/validators.js";


export const adminLoginService = async (email, password) => {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    throw new Error(emailValidation.message);
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (!user) {
    throw new Error("Admin not found");
  }

  if (!user.isAdmin) {
    throw new Error("Unauthorized admin access");
  }

  if (user.isBlocked) {
    throw new Error("Admin account is blocked");
  }

  if (user.googleId && !user.password) {
    return user;
  }

  if (!user.password) {
    throw new Error("Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid password");
  }

  return user;
};


export const getAllCustomersService = async ({
  page = 1,
  limit = 10,
  search = "",
  sort = "desc",
}) => {
  const skip = (page - 1) * limit;

  const query = {
    isAdmin: false,
    ...(search && {
      $or: [
        { full_name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ],
    }),
  };

  const sortOption = {
    createdAt: sort === "asc" ? 1 : -1,
  };

  const [customers, totalUsers] = await Promise.all([
    User.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean(),

    User.countDocuments(query),
  ]);

  return {
    customers,
    totalUsers,
  };
};


export const toggleBlockUserService = async (userId) => {
  const { valid } = validateObjectId(userId);
  if (!valid) {
    throw new Error('Invalid user ID');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  if (user.isAdmin) {
    throw new Error('Admin users cannot be blocked');
  }

  user.isBlocked = !user.isBlocked;
  await user.save();

  return {
    id: user._id,
    isBlocked: user.isBlocked,
  };
};





