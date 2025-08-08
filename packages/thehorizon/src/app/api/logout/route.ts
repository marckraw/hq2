import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    // Delete the auth cookie
    cookies().delete("auth-token");
    return new NextResponse("Logged out successfully", { status: 200 });
  } catch (error) {
    console.error("Logout error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
