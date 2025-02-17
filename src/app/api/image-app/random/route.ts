import { NextRequest, NextResponse } from 'next/server';
import { UnsplashClient } from '../../../image-app/services/client';

const client = new UnsplashClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const showUpload = searchParams.get('showUpload') == "1";
    const user = searchParams.get('user') || null;
    
    // Get client IP from headers
    const ip = request.headers.get('x-forwarded-for') || 'unknown-ip';
    
    const images = await client.getRandomImages(20, ip, user, showUpload, page);
    
    return NextResponse.json(images);
  } catch (error: any) {
    console.error('Random images fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch images' },
      { status: error.message === 'Rate limit exceeded' ? 429 : 500 }
    );
  }
}