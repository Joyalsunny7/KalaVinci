import User from "../models/user.js";
import bcrypt from "bcryptjs";


export const adminLoginService = async (email, password) => {
  const user = await User.findOne({ email });


  if (!user) {
    throw new Error("Admin not found");
  }

  if (!user.isAdmin) {
    throw new Error("Unauthorized admin access");
  }

  if (user.googleId) {
    return user;
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





