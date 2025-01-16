import { NextResponse } from 'next/server';
import DatabaseService from '@/app/utils/mongo';
import axios from 'axios';

const db = new DatabaseService();
const COLLECTION_NAME = 'webhooks';

async function handleRequest(
  request: Request,
  context: any
) {
  try {
    const params = await context.params;
    const collection = await db.getCollection(COLLECTION_NAME);
    const { id } = params;

    const method = request.method;
    const headers = Object.fromEntries(request.headers);
    const query = Object.fromEntries(new URL(request.url).searchParams);

    let body: any = null;
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      try {
        body = await request.json();
      } catch (e) {
        console.warn('No JSON body provided:', e);
      }
    }

    await collection.updateOne(
      { uniqueId: id },
      {
        $set: {
          lastRequest: {
            method,
            body,
            query,
            headers,
            timestamp: new Date(),
          },
        },
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

export { handleRequest as GET };
export { handleRequest as POST };
export { handleRequest as PUT };
export { handleRequest as DELETE };
export { handleRequest as PATCH };
// export { handleRequest as OPTIONS };
// export { handleRequest as HEAD };