import mongoose, { Schema } from "mongoose";

// Define the attendance schema
const attendanceSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId, // Reference to the user
      ref: "User", // The model name that this schema references
      required: [true, "User ID is required"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["present", "absent", "leave", "remote"],
      default: "present",
    },
    checkInTime: {
      type: Date,
    },
    checkOutTime: {
      type: Date,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
      },
    },
    shift: {
      type: String,
      enum: ["morning", "evening", "night"],
      default: "morning",
    },
    hoursWorked: {
      type: Number, // Total hours worked in the day
      default: 0,
    },
    overtime: {
      type: Number, // Overtime hours
      default: 0,
    },
    remarks: {
      type: String,
      trim: true,
    },
    leaveType: {
      type: String,
      enum: ["sick", "casual", "earned", "unpaid"],
      // Only required if status is 'leave'
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User", // Typically an admin or manager
    },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    attendanceType: {
      type: String,
      enum: ["on-site", "remote"],
      default: "on-site",
    },
    lateArrival: {
      type: Boolean,
      default: false,
    },
    earlyDeparture: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Create geospatial index for location
attendanceSchema.index({ location: "2dsphere" });

// Pre-save middleware to calculate hours worked
attendanceSchema.pre("save", function (next) {
  if (this.checkInTime && this.checkOutTime) {
    const diff = (this.checkOutTime - this.checkInTime) / (1000 * 60 * 60); // Difference in hours
    this.hoursWorked = diff > 0 ? diff : 0;
    // Optionally calculate overtime based on shift hours
    const standardHours = 8;
    if (this.hoursWorked > standardHours) {
      this.overtime = this.hoursWorked - standardHours;
    }
  }
  next();
});

// Create and export the model
const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;
