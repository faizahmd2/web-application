import { NextResponse } from 'next/server';
import DatabaseService from '@/app/utils/mongo';

const db = new DatabaseService();
const COLLECTION_NAME = 'webhooks';

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