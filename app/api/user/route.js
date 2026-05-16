import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { USER_TYPES } from "@/lib/enums";
import { getUsers } from "@/lib/repositories/UserRepository";
import {
  sendInviteEmail,
  sendPendingApprovalEmail,
  sendAdminNewPlayerEmail,
} from "@/lib/mailer";
import { SUPER_ADMINS } from "@/lib/constants";

// Helper to verify if the requester is a COACH

export const POST = async (request) => {
  try {
    const body = await request.json();
    const { email, userType, name, personalInfo, isVerified, phone } = body;
    console.log("[USER POST API REQUEST]", body);

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required." },
        { status: 400 },
      );
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User with this email already exists." },
        { status: 400 },
      );
    }

    const payload = {
      email,
      userType: userType || USER_TYPES.PLAYER,
      name: name || "",
      isVerified: isVerified === false ? false : true,
      phone: phone || "",
    };

    if (personalInfo) {
      payload.personalInfo = personalInfo;
    }

    const newUser = await User.create(payload);

    // Send email based on verification status
    if (newUser.isVerified) {
      // Verified user: send the standard invitation email
      sendInviteEmail(newUser.email, newUser.name).catch((err) =>
        console.error("[MAILER ERROR] Failed to send invite email", err),
      );
    } else {
      // Unverified (pending) user: notify player & admin
      sendPendingApprovalEmail(newUser.email, newUser.name).catch((err) =>
        console.error(
          "[MAILER ERROR] Failed to send pending approval email",
          err,
        ),
      );
      SUPER_ADMINS.forEach((adminEmail) => {
        sendAdminNewPlayerEmail(adminEmail, newUser.name, newUser.email).catch(
          (err) =>
            console.error(
              `[MAILER ERROR] Failed to send admin notification email to ${adminEmail}`,
              err,
            ),
        );
      });
    }

    return NextResponse.json(
      { success: true, message: "User created successfully.", user: newUser },
      { status: 201 },
    );
  } catch (error) {
    console.error("[USER POST API ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 },
    );
  }
};

export const GET = async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const userType = searchParams.get("userType");

    await connectDB();

    const users = await getUsers(userType);
    console.log("[USER GET API RESPONSE]", users);

    return NextResponse.json({ success: true, users }, { status: 200 });
  } catch (error) {
    console.error("[USER GET API ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 },
    );
  }
};
