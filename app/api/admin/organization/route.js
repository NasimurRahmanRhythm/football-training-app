import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Admin from "@/models/Admin";

export const POST = async (request) => {
  try {
    const body = await request.json();
    const { organization } = body;
    console.log(body);

    if (!organization) {
      return NextResponse.json(
        { success: false, message: "Organization name is required." },
        { status: 400 },
      );
    }

    await connectDB();

    // Fetch the single Admin document or create one if it doesn't exist
    let admin = await Admin.findOne();
    if (!admin) {
      admin = await Admin.create({ organizations: [organization] });
      return NextResponse.json(
        { success: true, message: "Organization added successfully.", admin },
        { status: 201 },
      );
    }

    // Check if the organization already exists
    if (admin.organizations.includes(organization)) {
      return NextResponse.json(
        { success: false, message: "Organization already exists." },
        { status: 400 },
      );
    }

    // Add organization to the existing array
    admin.organizations.push(organization);
    await admin.save();

    return NextResponse.json(
      { success: true, message: "Organization added successfully.", admin },
      { status: 200 },
    );
  } catch (error) {
    console.error("[ADMIN ORGANIZATION POST API ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 },
    );
  }
};

export const GET = async () => {
  try {
    await connectDB();
    const admin = await Admin.findOne();
    const organizations = admin ? admin.organizations : [];
    
    return NextResponse.json({ success: true, organizations }, { status: 200 });
  } catch (error) {
    console.error("[ADMIN ORGANIZATION GET API ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 },
    );
  }
};

export const DELETE = async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const org = searchParams.get("org");

    if (!org) {
      return NextResponse.json(
        { success: false, message: "Organization name is required." },
        { status: 400 },
      );
    }

    await connectDB();
    const admin = await Admin.findOne();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Admin data not found." },
        { status: 404 },
      );
    }

    admin.organizations = admin.organizations.filter((o) => o !== org);
    await admin.save();

    return NextResponse.json(
      { success: true, message: "Organization deleted successfully." },
      { status: 200 },
    );
  } catch (error) {
    console.error("[ADMIN ORGANIZATION DELETE API ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 },
    );
  }
};
