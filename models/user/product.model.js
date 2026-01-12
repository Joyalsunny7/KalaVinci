import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const productSchema = new Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true, default: 0 },
  size: { type: String, enum: ['Small','Medium','Large','Extra Large'], default: 'Medium' },
  images: [{ type: String }],
  category: { type: Schema.Types.ObjectId, ref: 'Category' },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'DELETED'], default: 'ACTIVE' },
  isBlocked: { type: Boolean, default: false },
  stock: { type: Number, default: 0 },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default model('Product', productSchema);
