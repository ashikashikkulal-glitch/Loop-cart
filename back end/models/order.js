// backend/models/order.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const orderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        productId: { type: String, required: true }, // id from product.json
        quantity: { type: Number, default: 1 },
      },
    ],
    totalAmount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "shipped", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
