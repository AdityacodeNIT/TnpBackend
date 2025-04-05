import mongoose, { Schema } from "mongoose";

const sliderImageSchema = new Schema(
  {
    url: { type: String, required: true },
    caption: { type: String , required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const SliderImage = mongoose.model("SliderImage", sliderImageSchema);