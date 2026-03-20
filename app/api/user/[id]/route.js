import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { getUserById } from "@/lib/repositories/UserRepository";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const GET = async (request, { params }) => {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "User ID is required." },
        { status: 400 },
      );
    }

    await connectDB();

    const user = await getUserById(id);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, user }, { status: 200 });
  } catch (error) {
    console.error(`[GET USER BY ID ERROR]`, error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 },
    );
  }
};

export const PATCH = async (request, { params }) => {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "User ID is required." },
        { status: 400 },
      );
    }

    await connectDB();

    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 },
      );
    }

    if (user.isVerified) {
      return NextResponse.json(
        { success: false, message: "User is already verified." },
        { status: 400 },
      );
    }

    user.isVerified = true;
    await user.save();

    return NextResponse.json(
      { success: true, message: "User verified successfully.", user },
      { status: 200 },
    );
  } catch (error) {
    console.error(`[PATCH USER BY ID ERROR]`, error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 },
    );
  }
};

export const PUT = async (request, { params }) => {
  try {
    const { id } = await params;
    const updateFields = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "User ID is required." },
        { status: 400 },
      );
    }

    await connectDB();

    const updatedUser = await User.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "User updated successfully.",
        user: updatedUser,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[USER PUT API ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 },
    );
  }
};

export const DELETE = async (request, { params }) => {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "User ID is required." },
        { status: 400 },
      );
    }

    await connectDB();

    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 },
      );
    }

    // Delete profile image from Cloudinary before removing the user
    const profileImageUrl = user?.personalInfo?.profileImage;
    if (profileImageUrl) {
      try {
        const matches = profileImageUrl.match(
          /\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-z]+)?$/,
        );
        if (matches && matches[1]) {
          await cloudinary.uploader.destroy(matches[1]);
        }
      } catch (deleteError) {
        // Non-fatal: log but continue with user deletion
        console.warn("[CLOUDINARY DELETE ON USER DELETE WARNING]", deleteError);
      }
    }

    await User.findByIdAndDelete(id);

    return NextResponse.json(
      { success: true, message: "User deleted successfully." },
      { status: 200 },
    );
  } catch (error) {
    console.error("[USER DELETE API ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 },
    );
  }
};
