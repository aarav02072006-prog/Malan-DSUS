const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    addresses: [
      {
        fullName: String,
        phone: String,
        addressLine: String,
        city: String,
        state: String,
        pincode: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("User", userSchema);