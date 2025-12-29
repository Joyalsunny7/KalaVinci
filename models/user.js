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
      required: function () {
      return !this.googleId;
    },
    },

    password: {
     type: String,
     required: function () {
     return !this.googleId;
    },
    },

    googleId: {
    type: String,
    },


    otp: {
     type: String,
    },

    otpExpiry: {
     type: Date,
    },

    profileImage: {
     type: String,
     default: null
    },

    isAdmin: {
      type: Boolean,
      default: false,  
    },

  },
  { timestamps: true }
);

const User = model("User", userSchema);
export default User;
