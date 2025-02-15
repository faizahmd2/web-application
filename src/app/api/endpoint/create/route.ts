import { NextRequest, NextResponse } from 'next/server';
import DatabaseService from '@/app/utils/mongo';
import { ApiEndpoint, ParamConfig } from '../type';
const dbService = new DatabaseService();

export async function POST(req: NextRequest) {
    try {
      const body = await req.json();
      const {
        path,
        method,
        responseData,
        pathParams,
        queryParams,
        template,
        expirationDays = 7
      } = body;
  
      if (!path || !method || (!responseData && !template)) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }
  
      // Validate parameter configurations
      if (pathParams) {
        const pathParamNames = path.match(/\{([^}]+)\}/g)?.map((p:any) => p.slice(1, -1)) || [];
        const configuredParams = pathParams.map((p: ParamConfig) => p.name);
        if (!pathParamNames.every((p: any) => configuredParams.includes(p))) {
          return NextResponse.json(
            { error: 'Path parameter configuration mismatch' },
            { status: 400 }
          );
        }
      }
  
      const collection = await dbService.getCollection('customApis');
      
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expirationDays);
  
      const endpoint: ApiEndpoint = {
        path,
        method,
        responseData,
        pathParams,
        queryParams,
        template,
        createdAt: new Date(),
        expiresAt
      };
  
      const result = await collection.insertOne(endpoint);
  
      return NextResponse.json({
        message: 'Endpoint created successfully',
        id: result.insertedId
      });
    } catch (error) {
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
}