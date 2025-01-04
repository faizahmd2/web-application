import { NextRequest, NextResponse } from 'next/server';
import { userOperations } from '@/lib/blog-app/supabase_login';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';
const { createUser, verifyUser } = userOperations;

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function POST(request: NextRequest) {
  const { username, password, action, name="NA" } = await request.json();
  const nextjsCookies = await cookies();

  if (action === 'register') {
    try {
      const userId = await createUser(username, password, name);
      const token = await new SignJWT({ userId, username })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('24h')
        .sign(JWT_SECRET);

        nextjsCookies.set('auth-token', token, { 
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      });

      return NextResponse.json({ success: true });
    } catch (error) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
    }
  }

  if (action === 'login') {
    const verify = await verifyUser(username, password);
    if (!verify.success) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const user = verify.user;

    const token = await new SignJWT({ userId: user.userId, username })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(JWT_SECRET);

      nextjsCookies.set('auth-token', token, { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}