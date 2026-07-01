import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Admin from "@/models/Admin";
import { sendOtpEmail } from "@/lib/mailer";
import { SUPER_ADMINS } from "@/lib/constants";
import { USER_TYPES } from "@/lib/enums";

/**
 * POST /api/auth/login
 *
 * Body: { "email": "user@example.com" }
 *
 * - Checks if the email exists in the DB.
 * - If yes, generates a 6-digit OTP, stores it (hashed) with a 10-min expiry, and sends it via email.
 * - If no, returns a 404 error.
 *
 * Admin access is determined by the `members` array on the Admin DB document.
 * Members are managed manually via the DB or via the "Add an Admin" feature (super admin only).
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required." },
        { status: 400 },
      );
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid email address." },
        { status: 400 },
      );
    }

    await connectDB();

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email is an admin member from the DB
    const adminDoc = await Admin.findOne();
    const isAdminMember = adminDoc
      ? adminDoc.members.map((m) => m.toLowerCase().trim()).includes(normalizedEmail)
      : false;

    // Also allow SUPER_ADMINS from constants as a safety fallback
    const isSuperAdmin = SUPER_ADMINS.some(
      (adminEmail) => adminEmail.toLowerCase().trim() === normalizedEmail,
    );

    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      if (isAdminMember || isSuperAdmin) {
        // Auto-create user account for admin members on first login
        user = await User.create({
          email: normalizedEmail,
          userType: USER_TYPES.COACH, // COACH is the base type for admins
          name: "Admin",
          phone: "0000000000", // Placeholder since phone is required
          isVerified: true,
        });
      } else {
        return NextResponse.json(
          {
            success: false,
            message: "No account found with this email address.",
          },
          { status: 404 },
        );
      }
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = { code: otp, expiresAt };
    await user.save();
    await sendOtpEmail(user.email, otp);

    return NextResponse.json(
      {
        success: true,
        message: `OTP sent successfully to ${user.email}. It is valid for 10 minutes.`,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[LOGIN API ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error. Please try again." },
      { status: 500 },
    );
  }
}