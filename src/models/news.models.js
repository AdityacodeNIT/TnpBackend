import mongoose, { Schema } from "mongoose";

const newsSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true, // URL that news points to
    },
    category: {
      type: String,
      enum: ["News & Events", "Notice Board"],
      default: "News & Events",
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const News = mongoose.model("News", newsSchema);
