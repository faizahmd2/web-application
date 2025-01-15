import { NextResponse } from 'next/server';
import DatabaseService from '@/app/utils/mongo';
import axios from 'axios';

const db = new DatabaseService();
const COLLECTION_NAME = 'webhooks';

export async function POST(
  request: Request,
  context: any
) {
  try {
    const params = await context.params;
    const collection = await db.getCollection(COLLECTION_NAME);
    const { id } = params;
    
    const body = await request.json();
    const headers = Object.fromEntries(request.headers);
    
    await collection.updateOne(
      { uniqueId: id },
      {
        $set: {
          lastRequest: {
            body,
            headers,
            method: request.method,
            timestamp: new Date()
          }
        }
      },
      { upsert: true }
    );

    await axios.get(`${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/api/socket/code-update/${id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  context: any
) {
  try {
    const params = await context.params;
    const id = params.id;
    const collection = await db.getCollection(COLLECTION_NAME);
    
    const webhookData = await collection.findOne({ uniqueId: id });
    
    if (!webhookData) {
        return NextResponse.json({webhookData: null});
    //   return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(webhookData);
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}