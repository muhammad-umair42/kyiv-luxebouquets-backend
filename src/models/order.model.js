import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    products: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: { type: String, required: true },
      },
    ],
    total: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      default: 'pending',
    },
    shippingAddress: {
      type: String,
      required: true,
    },
    payment: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true },
);

export const Order = mongoose.model('Order', orderSchema);
