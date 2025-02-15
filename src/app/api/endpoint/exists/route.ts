import { NextRequest, NextResponse } from 'next/server';
import DatabaseService from '@/app/utils/mongo';
const dbService = new DatabaseService();

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const pathValue = searchParams.get('search');

    const collection = await dbService.getCollection('customApis');
    const result = await collection.findOne({ path: pathValue, expiresAt: { $gt: new Date() } });
    console.log("result::", result);

    let exists = !!result;

    return NextResponse.json({ exists });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}