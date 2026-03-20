import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

/**
 * POST /api/auth/logout
 *
 * Header: Authorization: Bearer <token>
 *
 * Since JWTs are stateless, "logout" on the server side simply means
 * verifying the token is valid and telling the client to discard it.
 *
 * The React Native app MUST delete the stored token from
 * AsyncStorage / SecureStore upon receiving a success response.
 *
 * For stricter security you can maintain a token blacklist in Redis/DB,
 * but for most mobile apps discarding client-side is sufficient.
 */
export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "No token provided." },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    try {
      jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      // Expired or invalid token — still treat as logged out
      return NextResponse.json(
        {
          success: true,
          message: "Logged out successfully. Please clear the token on your device.",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Logged out successfully. Please clear the token on your device.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[LOGOUT API ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}
