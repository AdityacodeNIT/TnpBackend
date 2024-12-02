import mongoose, { Schema } from "mongoose";

const newsSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },

    author: {
      type: String,
      required: true,
    },
    category: { type: String },

    paragraphContent: [{ type: String, required: true }],

    paragraphImages: [
      {
        type: String,
      },
    ],

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

export const News = mongoose.model("News", newsSchema);
