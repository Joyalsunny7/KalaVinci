import mongoose from "mongoose";
const { Schema, model } = mongoose;

const adminSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      default: "admin",
      immutable: true, 
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    isAdmin: {
    type: Boolean,
    default: false
    },

    isBlocked: {
    type: Boolean,
    default: false,
    },


  },
  { timestamps: true }
);

const Admin = model("Admin", adminSchema);
export default Admin;
