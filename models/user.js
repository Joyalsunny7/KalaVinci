import mongoose from "mongoose";
const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    full_name: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [50, 'Name must be less than 50 characters'],
      validate: {
        validator: function(v) {
          return /^[a-zA-Z\s]+$/.test(v);
        },
        message: 'Name can only contain letters and spaces'
      }
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function(v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Please enter a valid email address'
      }
    },

    phone: {
      type: String,
      required: function () {
        return !this.googleId;
      },
      validate: {
        validator: function(v) {
          if (!v && this.googleId) return true;
          return /^[6-9]\d{9}$/.test(v);
        },
        message: 'Please enter a valid 10-digit phone number'
      }
    },

    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
      minlength: [8, 'Password must be at least 8 characters long'],
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

    isBlocked: {
    type: Boolean,
    default: false
}

  },
  { timestamps: true }
);

const User = model("User", userSchema);
export default User;
