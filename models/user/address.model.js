import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^[6-9]\d{9}$/.test(v);
        },
        message: 'Please enter a valid 10-digit phone number'
      }
    },

    addressLine: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
    },

    state: {
      type: String,
      required: true,
    },

    pincode: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^\d{6}$/.test(v);
        },
        message: 'Pincode must be 6 digits'
      }
    },

    isDefault: {
      type: Boolean,
      default: false,
    },

    label: {
     type: String,
     enum: ['Home', 'Office', 'Work'],
     required: true,
    }

  },
  { timestamps: true }
);

export default mongoose.model('Address', addressSchema);
