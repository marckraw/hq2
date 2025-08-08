import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sign } from "jsonwebtoken";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    // Get the stored hash from environment variable
    const storedCombined = process.env.AUTH_PASSWORD_HASH;
    const jwtSecret = process.env.JWT_SECRET;

    if (!storedCombined || !jwtSecret) {
      console.error("Missing environment variables:", {
        hasPasswordHash: !!storedCombined,
        hasJwtSecret: !!jwtSecret,
      });
      return new NextResponse("Server configuration error", { status: 500 });
    }

    // Split stored value into salt and hash
    const [salt, storedHash] = storedCombined.split(":");

    // Generate hash with provided password
    const hash = crypto
      .createHash("sha256")
      .update(salt + password)
      .digest("hex");

    // Compare hashes
    const isValid = hash === storedHash;

    if (!isValid) {
      return new NextResponse("Invalid password", { status: 401 });
    }

    // Generate a JWT token
    const token = sign({ authorized: true }, jwtSecret, { expiresIn: "7d" });

    // Set the cookie
    cookies().set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return new NextResponse("Logged in successfully", { status: 200 });
  } catch (error) {
    console.error("Login error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
