import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const response = NextResponse.json({ message: "Logged out successfully" });

  response.cookies.set("auth-token", "", {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    expires: new Date(0)
  });

  return response;
}
