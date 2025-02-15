export type ParamConfig = {
    name: string;
    type: 'string' | 'number' | 'boolean';
    required?: boolean;
    default?: any;
};
  
export type ApiEndpoint = {
    _id?: string;
    path: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    responseData: any;
    pathParams?: ParamConfig[];
    queryParams?: ParamConfig[];
    template?: string;  // Response template with parameter placeholders
    createdAt: Date;
    expiresAt?: Date;
};