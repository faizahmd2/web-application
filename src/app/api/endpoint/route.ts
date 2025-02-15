import { NextRequest, NextResponse } from 'next/server';
import DatabaseService from '@/app/utils/mongo';
const dbService = new DatabaseService();
import { ParameterHandler } from './parameter';
import { ApiEndpoint } from './type';

export async function GET(req: NextRequest) {
  try {
    const collection = await dbService.getCollection('customApis');
    const searchParams = req.nextUrl.searchParams;
    const searchQuery = searchParams.get('search');
    
    // Build query
    const baseQuery = {
      expiresAt: { $gt: new Date() }
    };

    // Add search condition if search parameter exists
    const query = searchQuery 
      ? {
          ...baseQuery,
          $or: [
            { name: { $regex: searchQuery, $options: 'i' } },
            { description: { $regex: searchQuery, $options: 'i' } },
            { endpoint: { $regex: searchQuery, $options: 'i' } }
          ]
        }
      : baseQuery;

    // Find matching endpoints and sort by createdAt in descending order
    const endpoints: ApiEndpoint[] = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(endpoints);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message ? 400 : 500 }
    );
  }
}