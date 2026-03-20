import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import User from "@/models/User";

/**
 * POST /api/auth/verify-otp
 *
 * Body: { "email": "user@example.com", "otp": "123456" }
 *
 * On success:
 *  - Clears the OTP from the user document.
 *  - Marks isVerified = true.
 *  - Returns a signed JWT containing { userId, userType }.
 *    → Store this token in React Native (AsyncStorage / SecureStore).
 *    → Send it as:  Authorization: Bearer <token>  on every protected request.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: "Email and OTP are required." },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { success: false, message: "OTP must be a 6-digit number." },
        { status: 400 }
      );
    }

    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "No account found with this email address." },
        { status: 404 }
      );
    }

    if (!user.otp || !user.otp.code) {
      return NextResponse.json(
        {
          success: false,
          message: "No OTP was requested for this account. Please login first.",
        },
        { status: 400 }
      );
    }

    if (new Date() > new Date(user.otp.expiresAt)) {
      user.otp = { code: null, expiresAt: null };
      await user.save();
      return NextResponse.json(
        {
          success: false,
          message: "OTP has expired. Please request a new one.",
        },
        { status: 400 }
      );
    }

    if (user.otp.code !== otp) {
      return NextResponse.json(
        { success: false, message: "Invalid OTP. Please try again." },
        { status: 400 }
      );
    }

    user.otp = { code: null, expiresAt: null };
    user.isVerified = true;
    await user.save();

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        userType: user.userType,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    return NextResponse.json(
      {
        success: true,
        message: "OTP verified successfully. You are now logged in.",
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          userType: user.userType,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[VERIFY OTP API ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}
