import mongoose, { Schema } from "mongoose";

const eventSchema = new Schema(
  {
    photos: {
      type: [String],
      required: true, // URL or local path to the image
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    paragraph: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt fields
  }
);

export const Event = mongoose.model("Event", eventSchema);
