import { NextRequest } from "next/server";
import { CookieUser } from "./types";
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';


export async function getUserFromRequest(request: NextRequest): Promise<CookieUser | null> {
  try {
    const nextjsCookies = await cookies();
    const token = nextjsCookies.get('auth-token')?.value;

    if (!token) {
      return null;
    }

    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));

    // Type guard to ensure payload has the expected properties
    if (typeof payload === 'object' && payload !== null && 'userId' in payload && 'username' in payload) {
      const user: CookieUser = {
        userId: payload.userId as string,
        username: payload.username as string,
      };
      return user;
    } else {
      console.error("Invalid JWT payload:", payload);
      return null;
    }

  } catch (error) {
    // Token is invalid or expired
    console.error("JWT verification error:", error);
    return null;
  }
}

export async function getUserFromServerRequest(): Promise<CookieUser | null> {
  try {
    const nextjsCookies = await cookies();

    const token = nextjsCookies.get('auth-token')?.value;

    if (!token) {
      return null;
    }

    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));

    if (typeof payload === 'object' && payload !== null && 'userId' in payload && 'username' in payload) {
      const user: CookieUser = {
        userId: payload.userId as string,
        username: payload.username as string,
      };
      return user;
    } else {
      console.error("Invalid JWT payload:", payload);
      return null;
    }

  } catch (error) {
    console.error("JWT verification error:", error);
    return null;
  }
}