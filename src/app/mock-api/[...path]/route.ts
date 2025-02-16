// app/api/endpoints/[path]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import DatabaseService from '@/app/utils/mongo';
import { ParameterHandler } from '../../api/endpoint/parameter';
import { ApiEndpoint } from '../../api/endpoint/type';

const dbService = new DatabaseService();

// Common function to handle endpoint matching and parameter processing
async function handleRequest(req: NextRequest, method: string) {
  const fullPath = req.nextUrl.pathname.replace('/mock-api', '');
  const searchParams = Object.fromEntries(req.nextUrl.searchParams);
  
  const collection = await dbService.getCollection('customApis');
  
  // Find matching endpoint by pattern and method
  const endpoints: ApiEndpoint[] = await collection.find({
    method: method,
    expiresAt: { $gt: new Date() }
  }).toArray();

  const matchingEndpoint = endpoints.find(endpoint => {
    const pattern = endpoint.path.replace(/\{([^}]+)\}/g, '([^/]+)');
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(fullPath);
  });

  if (!matchingEndpoint) {
    return NextResponse.json(
      { error: `No ${method} endpoint found for this path` },
      { status: 404 }
    );
  }

  // Extract and validate path parameters
  const pathParamValues = fullPath.match(
    new RegExp(matchingEndpoint.path.replace(/\{([^}]+)\}/g, '([^/]+)'))
  )?.slice(1) || [];

  const pathParams: Record<string, any> = {};
  matchingEndpoint.pathParams?.forEach((param: any, index: number) => {
    pathParams[param.name] = ParameterHandler.validateParam(
      pathParamValues[index],
      param
    );
  });

  // Validate query parameters
  const queryParams: Record<string, any> = {};
  matchingEndpoint.queryParams?.forEach((param: any) => {
    queryParams[param.name] = ParameterHandler.validateParam(
      searchParams[param.name],
      param
    );
  });

  // Handle request body for POST/PUT methods
  let bodyParams: Record<string, any> = {};
  if (method === 'POST' || method === 'PUT') {
    try {
      const body = await req.json();
      bodyParams = body;
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
  }

  // Combine all parameters
  const allParams = { ...pathParams, ...queryParams, ...bodyParams };

  // Process response
  let response;
  if (matchingEndpoint.template) {
    response = ParameterHandler.processTemplate(
      matchingEndpoint.template,
      allParams
    );
  } else {
    response = matchingEndpoint.responseData;
  }

  return NextResponse.json(response);
}

// Route handlers for each HTTP method
export async function GET(req: NextRequest) {
  try {
    return await handleRequest(req, 'GET');
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message ? 400 : 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    return await handleRequest(req, 'POST');
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message ? 400 : 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    return await handleRequest(req, 'PUT');
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message ? 400 : 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    return await handleRequest(req, 'DELETE');
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message ? 400 : 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    return await handleRequest(req, 'PATCH');
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message ? 400 : 500 }
    );
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}