import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    full_name: { /* unchanged */ },
    email: { /* unchanged */ },
    phone: { /* unchanged */ },

    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
      minlength: 8,
    },

    googleId: { type: String },

    otp: String,
    otpExpiry: Date,

    profileImage: {
      type: String,
      default: null,
    },

    isAdmin: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);


userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

const User = model("User", userSchema);
export default User;
