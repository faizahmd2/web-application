import { getImageIdFromUrl } from '@/app/utils/image-url-converter';
import DatabaseService from '@/app/utils/mongo';
import { NextResponse } from 'next/server';
const dbService = new DatabaseService();

export async function POST(request: Request) {
  try {
    const urlObj = new URL(request.url);
    const user = urlObj.searchParams.get('user') || null;
    const formData = await request.formData();
    const tags = formData.get('tags') || "";
    let tagsArray = tags.toString().split(",");

    const imgurResponse = await fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        'Authorization': `Client-ID ${process.env.IMGUR_CLIENT_ID}`,
      },
      body: formData
    });

    const imgurData = await imgurResponse.json();
    const imageId = getImageIdFromUrl(imgurData.data.link);

    if(imageId) {
      const imagesCollection = await dbService.getCollection('images');
      await imagesCollection.insertOne({
        user: user,
        imageId: imageId,
        tags: tagsArray,
        uploadDate: new Date()
      });
    }

    return NextResponse.json({
      success: true,
      imageUrl: urlObj.origin + "/image/"+imageId,
    });
  } catch (error) {
    console.log("UPLOAD CATCH ERROR:",error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}