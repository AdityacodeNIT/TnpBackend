import mongoose, { Schema } from "mongoose";

const productSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },

    manufacturer: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String,
        required: true, // URL of the uploaded image
      },
    ],
    tags: [
      {
        type: String,
      },
    ],

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User", // Reference to the user who owns the car
      required: true,
    },
  },
  { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);
