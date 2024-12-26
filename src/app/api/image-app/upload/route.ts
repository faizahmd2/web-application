import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get('image');
    const tags = formData.get('tags');

    // For example, using imgur API:
    const imgurResponse = await fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        'Authorization': `Client-ID ${process.env.IMGUR_CLIENT_ID}`,
      },
      body: formData,
    });

    const imgurData = await imgurResponse.json();

    return NextResponse.json({
      success: true,
      imageUrl: imgurData.data.link,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}