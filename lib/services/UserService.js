"use server";
import User from "@/models/User";
import connectDB from "@/lib/db";

export const createFirstUser = async () => {
    await connectDB();
    await User.create({
        email: "rhythm4538@gmail.com",
        name: "Admin-coach",
        userType: "COACH",
        isVerified: true,
    })
}
