import { NextResponse } from 'next/server';
import { UnsplashClient } from '../../../image-app/services/client';

const client = new UnsplashClient();

export async function GET(request: Request) {
  try {
    const url = new URL(request.url, `http://localhost`);
    const searchParams = new URLSearchParams(url.search);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const showUpload = searchParams.get('showUpload') === "true";
    const user = searchParams.get('user') || null;
    const query = searchParams.get('query');
    
    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }
    
    // Get client IP from headers
    const ip = request.headers.get('x-forwarded-for') || 'unknown-ip';
    
    const images = await client.searchImages(query, page, ip, user, showUpload);
    
    return NextResponse.json(images);
  } catch (error: any) {
    console.error('Search images fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch images' },
      { status: error.message === 'Rate limit exceeded' ? 429 : 500 }
    );
  }
}