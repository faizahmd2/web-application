import { NextResponse } from 'next/server';
import { UnsplashClient } from '../../../image-app/services/client';

const client = new UnsplashClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    
    // Get client IP from headers
    const ip = request.headers.get('x-forwarded-for') || 'unknown-ip';
    
    const images = await client.getRandomImages(20, ip);
    
    return NextResponse.json(images);
  } catch (error: any) {
    console.error('Random images fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch images' },
      { status: error.message === 'Rate limit exceeded' ? 429 : 500 }
    );
  }
}