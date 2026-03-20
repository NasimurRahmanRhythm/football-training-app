import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { v2 as cloudinary } from "cloudinary";
import sharp from "sharp";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const POST = async (request, { params }) => {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "User ID is required." },
        { status: 400 },
      );
    }

    const formData = await request.formData();
    // Accept either "image" or "profileImage" as the form field name
    const file = formData.get("image") || formData.get("profileImage");

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No image file provided." },
        { status: 400 },
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Compress the image using sharp
    // Resize to a maximum width of 1024px, maintaining aspect ratio.
    // Compressing with jpeg quality 80 helps ensure file size constraints.
    const compressedBuffer = await sharp(buffer)
      .resize({ width: 1024, withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();

    // Upload to Cloudinary using upload_stream
    const uploadToCloudinary = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "profile_images" },
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          },
        );
        stream.end(compressedBuffer);
      });
    };

    const cloudinaryResult = await uploadToCloudinary();

    await connectDB();

    // Fetch the current user to get the existing profile image URL
    const existingUser = await User.findById(id);

    if (!existingUser) {
      // New image was already uploaded — clean it up before returning 404
      await cloudinary.uploader.destroy(cloudinaryResult.public_id);
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 },
      );
    }

    // Delete the old profile image from Cloudinary (if one exists)
    const oldImageUrl = existingUser?.personalInfo?.profileImage;
    if (oldImageUrl) {
      try {
        // Extract the public_id: everything after "/upload/" and before the file extension
        // e.g. "https://res.cloudinary.com/<cloud>/image/upload/v123/profile_images/abc.jpg"
        //   => public_id is "profile_images/abc"
        const matches = oldImageUrl.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-z]+)?$/);
        if (matches && matches[1]) {
          await cloudinary.uploader.destroy(matches[1]);
        }
      } catch (deleteError) {
        // Non-fatal: log the error but continue with the update
        console.warn("[CLOUDINARY DELETE OLD IMAGE WARNING]", deleteError);
      }
    }

    // Update the specific user's profile image with the new Cloudinary URL
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { "personalInfo.profileImage": cloudinaryResult.secure_url },
      { new: true, runValidators: true },
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Profile image uploaded successfully.",
        profileImage: cloudinaryResult.secure_url,
        user: updatedUser,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[PROFILE IMAGE UPLOAD ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 },
    );
  }
};
