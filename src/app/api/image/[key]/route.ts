import { NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';
import { getImageIdFromUrl, getUrlFromImageId } from '@/app/utils/image-url-converter';

export async function GET(request: Request) {
  const key = getImageIdFromUrl(request.url);

  if (!key) {
    return NextResponse.json(
      { error: 'Invalid key parameter' },
      { status: 400 }
    );
  }

  try {
    const originalUrl = getUrlFromImageId(key);

    try {
      new URL(originalUrl);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    const response = await axios.get<Buffer>(originalUrl, {
      responseType: 'arraybuffer',
      timeout: 5000,
    });

    const contentType = response.headers['content-type'];
    const extension = contentType.split('/')[1];

    const headers = new Headers({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="downloaded-image.${extension}"`,
    });

    return new Response(response.data, { headers });
  } catch (error) {
    console.error('Error processing image:', error);

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        return NextResponse.json(
          { error: 'Image not found' },
          { status: 404 }
        );
      }
      if (axiosError.code === 'ECONNABORTED') {
        return NextResponse.json(
          { error: 'Request timeout' },
          { status: 504 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    );
  }
}
