import { NextRequest, NextResponse } from 'next/server';
import DatabaseService from '@/app/utils/mongo';
const dbService = new DatabaseService();

export async function GET(req: NextRequest) {
  try {
    const collection = await dbService.getCollection('movies');
    const { searchParams } = req.nextUrl;
    
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = parseInt(searchParams.get('skip') || '0');
    
    const movies = await collection
      .find({})
      .limit(limit)
      .skip(skip)
      .toArray();

    return NextResponse.json(movies);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}