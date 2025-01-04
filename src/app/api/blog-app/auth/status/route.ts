import { NextRequest, NextResponse } from 'next/server';
import { getUserFromServerRequest } from '@/lib/blog-app/auth';

export async function GET(request: NextRequest) {
  const user = await getUserFromServerRequest();
  return NextResponse.json({loggedIn: !!user, user: user && { username: user.username }});
}