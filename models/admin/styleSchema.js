import mongoose from "mongoose";

const { Schema, model } = mongoose;

const styleSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "DELETED"],
      default: "ACTIVE",
    },
  },
  { timestamps: true }
);

export default model("Style", styleSchema);
