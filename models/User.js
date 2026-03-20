import mongoose from "mongoose";
import { USER_TYPES } from "@/lib/enums";
import PersonalInfoSchema from "./inner-schema/PersonalInfo";

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    userType: {
      type: String,
      enum: Object.values(USER_TYPES),
      default: USER_TYPES.COACH,
    },
    name: {
      type: String,
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      code: {
        type: String,
        default: null,
      },
      expiresAt: {
        type: Date,
        default: null,
      },
    },
    personalInfo: PersonalInfoSchema,
  },
  {
    timestamps: true,
  },
);

// Avoid model overwrite error in Next.js dev mode (hot reload)
const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
