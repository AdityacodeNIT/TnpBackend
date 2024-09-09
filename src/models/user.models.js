import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "UserName is Required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    avatar: {
      type: String, // Cloudnary url
      required: true,
    },
    coverImage: {
      type: String, // cloudinary
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      validate: {
        validator: function (value) {
          // Regex to ensure password contains at least one letter, one number, and one special character
          return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/.test(
            value
          );
        },
        message:
          "Password must contain at least one letter, one number, and one special character.",
      },
    },

    // Role (e.g., employee or admin)
    role: {
      type: String,
      enum: ["employee", "admin"],
      default: "employee",
    },

    // Current Location (for initial geolocation data)
    currentLocation: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },

    // Registration Date
    registrationDate: {
      type: Date,
      default: Date.now,
    },

    // Optional: Phone Number for contact info
    phoneNumber: {
      type: String,
      trim: true,
      match: [/^\d{10}$/, "Please enter a valid 10-digit phone number"],
    },

    refreshToken: {
      type: String,
    },
  },

  { timestamps: true }
);

userSchema.index({ location: "2dsphere" });
const User = mongoose.model("User", userSchema);
export default User;
