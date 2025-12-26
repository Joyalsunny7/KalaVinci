import mongoose from "mongoose";
const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    full_name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    otp: {
     type: String,
    },

    otpExpiry: {
     type: Date,
    },

  },
  { timestamps: true }
);

const User = model("User", userSchema);
export default User;
