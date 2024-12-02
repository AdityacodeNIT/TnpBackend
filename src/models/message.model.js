import mongoose, { Schema } from "mongoose";

const newsSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    date: { type: Date, required: true },

    location: { type: String, required: true, trim: true },

    content: { type: String, required: true },
    author: { type: String, required: true, trim: true },

    source: {
      type: String,

      required: true,
      trim: true,
    },

    tags: { type: String },
    images: { type: String },
  },
  {
    timeStamps: true,
  }
);
