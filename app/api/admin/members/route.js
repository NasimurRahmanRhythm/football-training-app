import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Admin from "@/models/Admin";
import { SUPER_ADMINS } from "@/lib/constants";

/**
 * GET /api/admin/members
 * Returns the list of admin members from the DB.
 */
export const GET = async () => {
  try {
    await connectDB();
    let admin = await Admin.findOne();
    return NextResponse.json(
      { success: true, members: admin.members },
      { status: 200 },
    );
  } catch (error) {
    console.error("[ADMIN MEMBERS GET ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 },
    );
  }
};

/**
 * POST /api/admin/members
 * Body: { requesterEmail: string, newMemberEmail: string }
 *
 * Only emails listed in the SUPER_ADMINS constant can add new admin members.
 * The new member email is added to admin.members in the DB.
 */
export const POST = async (request) => {
  try {
    const body = await request.json();
    const { requesterEmail, newMemberEmail } = body;

    if (!requesterEmail || !newMemberEmail) {
      return NextResponse.json(
        { success: false, message: "requesterEmail and newMemberEmail are required." },
        { status: 400 },
      );
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(newMemberEmail)) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid email address." },
        { status: 400 },
      );
    }

    const normalizedRequester = requesterEmail.toLowerCase().trim();
    const normalizedNewMember = newMemberEmail.toLowerCase().trim();

    // Only SUPER_ADMINS from constants can add new admin members
    const isSuperAdmin = SUPER_ADMINS.some(
      (email) => email.toLowerCase().trim() === normalizedRequester,
    );

    if (!isSuperAdmin) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized: Only Super Admins can add new admin members.",
        },
        { status: 403 },
      );
    }

    await connectDB();
    const admin = await Admin.findOne();

    const alreadyExists = admin.members
      .map((m) => m.toLowerCase().trim())
      .includes(normalizedNewMember);

    if (alreadyExists) {
      return NextResponse.json(
        { success: false, message: "This email is already an admin member." },
        { status: 400 },
      );
    }

    admin.members.push(normalizedNewMember);
    await admin.save();

    return NextResponse.json(
      {
        success: true,
        message: `${normalizedNewMember} has been added as an admin member.`,
        members: admin.members,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[ADMIN MEMBERS POST ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 },
    );
  }
};
