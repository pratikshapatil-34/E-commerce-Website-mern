import mongoose from 'mongoose';

const CartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, 'Quantity must be at least 1'],
          default: 1,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    subtotal: {
      type: Number,
      default: 0,
    },
    shipping: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      default: 0,
    },
    coupon: {
      code: String,
      discount: Number,
    },
  },
  { timestamps: true }
);

// Method to calculate totals
CartSchema.methods.calculateTotals = function () {
  this.subtotal = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  this.shipping = this.subtotal > 50 ? 0 : 10;
  this.tax = this.subtotal * 0.08;
  const discount = this.coupon?.discount || 0;
  this.total = this.subtotal + this.shipping + this.tax - discount;
  return this;
};

export default mongoose.model('Cart', CartSchema);
