'use client';

import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { Plus, Trash2, RefreshCw, Code, X, Copy, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import DeleteConfirmationDialog from '@/components/ui/delete-popup';
import { Toaster, toast } from 'sonner'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Types and Interfaces
interface Param {
  name: string;
  type: 'string' | 'number' | 'boolean';
  required: boolean;
  default?: string;
}

interface Endpoint {
  _id: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  createdAt: string;
  expiresAt: string;
  responseData?: Record<string, unknown>;
  template?: string;
  pathParams?: Param[];
  queryParams?: Param[];
}

interface ParamConfigProps {
  params: Param[];
  setParams: Dispatch<SetStateAction<Param[]>>;
  label: string;
}

interface EndpointCardProps {
  endpoint: Endpoint;
  onDelete: (id: string) => void;
}

type SnippetType = 'curl' | 'nodejs' | 'fetch' | 'url';

const ParamConfig: React.FC<ParamConfigProps> = ({ params, setParams, label }) => {
  const addParam = () => {
    setParams([...params, { name: '', type: 'string', required: false }]);
  };

  const removeParam = (index: number) => {
    setParams(params.filter((_, i) => i !== index));
  };

  const updateParam = (index: number, field: keyof Param, value: string | boolean) => {
    const newParams = [...params];
    newParams[index] = { ...newParams[index], [field]: value };
    setParams(newParams);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium">{label}</label>
        <Button variant="outline" size="sm" onClick={addParam}>
          <Plus className="h-4 w-4 mr-2" />
          Add Parameter
        </Button>
      </div>
      {params.map((param, index) => (
        <div key={index} className="flex gap-2 items-start">
          <Input
            placeholder="Parameter name"
            value={param.name}
            onChange={(e) => updateParam(index, 'name', e.target.value)}
            className="flex-1"
          />
          <Select
            value={param.type}
            onValueChange={(value) => updateParam(index, 'type', value as Param['type'])}
          >
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="string">String</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="boolean">Boolean</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <label className="text-sm">
              <input
                type="checkbox"
                checked={param.required}
                onChange={(e) => updateParam(index, 'required', e.target.checked)}
                className="mr-1"
              />
              Required
            </label>
          </div>
          <Input
            placeholder="Default"
            value={param.default || ''}
            onChange={(e) => updateParam(index, 'default', e.target.value)}
            className="w-24"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeParam(index)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
};

const EndpointCard: React.FC<EndpointCardProps> = ({ endpoint, onDelete }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    projectId: "",
    projectName: ''
  });
  const [isDeleting, setIsDeleting] = useState(false);
 
  // const copyEndpointUrl = () => {
  //   const baseUrl = window.location.origin;
  //   const url = `${baseUrl}/api/endpoint${endpoint.path}`;
  //   navigator.clipboard.writeText(url);
    
  // };

  const generateCodeSnippet = (api: Endpoint, type: SnippetType): string => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const endpoint = `${baseUrl}/mock-api${api.path}`;
  
    const snippets: Record<SnippetType, string> = {
      url: endpoint,

      curl: `curl -X ${api.method} "${endpoint}" \\ -H "Content-Type: application/json"${api.method !== 'GET' ? ' \\ -d \'{"example": "data"}\'' : ''}`,
  
      nodejs: `const axios = require('axios');
      const options = {
        method: '${api.method}',
        url: '${endpoint}',
        headers: { 'Content-Type': 'application/json' }${api.method !== 'GET' ? `,
        data: { example: 'data' }` : ''}
      };
  
      axios(options)
        .then(response => console.log(response.data))
        .catch(error => console.error(error));`,
      
      fetch: `fetch('${endpoint}', {
        method: '${api.method}',
        headers: {
          'Content-Type': 'application/json'
        }${api.method !== 'GET' ? `,
        body: JSON.stringify({ example: 'data' })` : ''}
      })
        .then(response => response.json())
        .catch(error => console.error(error));`
    };
  
    return snippets[type] || '';
  };

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast.success(message || "Copied Successfully");
  };

  const handleDeleteClick = (api: Endpoint) => {
    setDeleteDialog({
      isOpen: true,
      projectId: api._id,
      projectName: api.path
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/endpoint/delete/${deleteDialog.projectId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      onDelete(deleteDialog.projectId);
      setDeleteDialog({ isOpen: false, projectId: "", projectName: '' });
      toast.success(`Endpont ${deleteDialog.projectName} Deleted!`);
    } catch (error) {
      // console.error('Error deleting project:', error);
      toast.error("Error deleting endpoint");
      // You might want to show an error toast here
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card>
      <Toaster />
      <CardHeader className="pb-3">
        <div className="flex justify-between">
          <div>
            <CardTitle className="text-lg font-bold">{endpoint.path}</CardTitle>
            <CardDescription className="mt-1">
              Created {new Date(endpoint.createdAt).toLocaleDateString()}
            </CardDescription>
          </div>
          <div className="flex justify-between gap-2 items-center">
            <Badge className="py-1 h-8"
              variant={
                endpoint.method === 'GET'
                  ? 'default'
                  : endpoint.method === 'POST'
                  ? 'secondary'
                  : endpoint.method === 'PUT'
                  ? 'outline'
                  : 'destructive'
              }
            >
              {endpoint.method}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Code className="w-3 mr-1" />
                  {/* Code */}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-50">
                <DropdownMenuItem 
                  onClick={() => copyToClipboard(generateCodeSnippet(endpoint, 'url'), "URL Copied Succesfully")}
                >
                  Copy URL
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => copyToClipboard(generateCodeSnippet(endpoint, 'curl'), "cURL Copied Succesfully")}
                >
                  Copy cURL
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => copyToClipboard(generateCodeSnippet(endpoint, 'nodejs'), "Axios request Copied Succesfully")}
                >
                  Copy Node.js
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => copyToClipboard(generateCodeSnippet(endpoint, 'fetch'), "Fetch Request Copied Succesfully")}
                >
                  Copy Fetch
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {/* DELETE Logic */}
            <Button className="text-sm p-1 h-8 rounded-sm" onClick={() => handleDeleteClick(endpoint)}>delete</Button>
            <DeleteConfirmationDialog
              isOpen={deleteDialog.isOpen}
              onClose={() => setDeleteDialog({ isOpen: false, projectId: '', projectName: '' })}
              onConfirm={handleDeleteConfirm}
              projectName={deleteDialog.projectName}
              isDeleting={isDeleting}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium">Response Preview</h4>
              <Button variant="ghost" size="sm" onClick={() => setShowDetails(!showDetails)}>
                {showDetails ? 'Show Less' : 'Show More'}
              </Button>
            </div>
            <pre
              className={`text-sm bg-muted p-2 rounded-md overflow-x-auto ${
                showDetails ? 'max-h-96' : 'max-h-24'
              }`}
            >
              {JSON.stringify(endpoint.responseData || endpoint.template, null, 2)}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const [endpoints, setEndpoints] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [urlPreview, setUrlPreview] = useState('');
  const [pathAlreadyExist, setPathAlreadyExist] = useState(false);
  const [invalidPath, setInvalidPath] = useState(false);
  const [formData, setFormData] = useState<any>({
    path: '',
    method: 'GET',
    responseData: '',
    template: '',
    pathParams: [],
    queryParams: [],
    expirationDays: 7
  });

  const fetchEndpoints = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/endpoint');
      const data = await response.json();
      if(Array.isArray(data)) {
        setEndpoints(data);
      } else {
        toast.error("Failed to fetch endpoints:"+data.error);
      }
    } catch (error) {
      toast.error("Failed to fetch endpoints");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchEndpoints();
  }, []);

  const onPathChange = async (path: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    if(path) {
      // const response = await fetch(`${baseUrl}/api/endpoint/exists?path=${path}`);
      // const data = await response.json();
      // console.log("DATA RECEIVED:",data);
      // setPathAlreadyExist(data.exists);
      if(path[0] === '/') {
        setInvalidPath(false);
      } else {
        setInvalidPath(true);
      }
      setUrlPreview(`${baseUrl}/mock-api${path}`)
    } else setUrlPreview('');
    setFormData({ ...formData, path: path });
  }

  const createEndpoint = async () => {
    // console.log("CLICK CALLED",formData);
    setIsCreating(true);
    try {
      let parsedResponseData;
      if (formData.responseData) {
        try {
          parsedResponseData = JSON.parse(formData.responseData);
        } catch {
          throw new Error('Invalid JSON data');
        }
      }
      
      const response = await fetch('/api/endpoint/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          responseData: parsedResponseData
        })
      });

      if (!response.ok) throw new Error('Failed to create endpoint');

      toast.success("Endpoint created successfully");

      setUrlPreview('');
      setShowCreateDialog(false);
      fetchEndpoints();
      setFormData({
        path: '',
        method: 'GET',
        responseData: '',
        template: '',
        pathParams: [],
        queryParams: [],
        expirationDays: 7
      });
    } catch (error: any) {
      console.log("ERROR", error);
      toast.error(error.message);
    }
    setIsCreating(false);
  };

  const deleteEndpoint = async (id: string) => {
    fetchEndpoints();
  };

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">API Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Manage your custom API endpoints</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={fetchEndpoints}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Endpoint
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px]">
              <DialogHeader>
                <DialogTitle>Create New API Endpoint</DialogTitle>
              </DialogHeader>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Basic</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <label htmlFor="path">Path</label>
                      <Input
                        id="path"
                        placeholder="/api/endpoint/"
                        value={formData.path}
                        onChange={(e) => onPathChange(e.target.value)}
                      />
                      {urlPreview && <div className={`${(pathAlreadyExist || invalidPath) ? 'text-red-600' : 'text-green-600'}`}>{urlPreview}</div>}
                    </div>
                    <div className="grid gap-2">
                      <label>Method</label>
                      <Select
                        value={formData.method}
                        onValueChange={(value) => setFormData({ ...formData, method: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GET">GET</SelectItem>
                          <SelectItem value="POST">POST</SelectItem>
                          <SelectItem value="PUT">PUT</SelectItem>
                          <SelectItem value="DELETE">DELETE</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <label>Response Data (JSON)</label>
                      <Textarea
                        placeholder="{ 'key': 'value' }"
                        value={formData.responseData}
                        onChange={(e) => setFormData({ ...formData, responseData: e.target.value })}
                        className="h-32"
                      />
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="advanced" className="space-y-4">
                  <Alert>
                    <AlertDescription>
                      Use {'{paramName}'} syntax in your path and response template to handle dynamic values.
                    </AlertDescription>
                  </Alert>
                  <div className="grid gap-4">
                    <ParamConfig
                      params={formData.pathParams}
                      setParams={(params) => setFormData({ ...formData, pathParams: params })}
                      label="Path Parameters"
                    />
                    <ParamConfig
                      params={formData.queryParams}
                      setParams={(params) => setFormData({ ...formData, queryParams: params })}
                      label="Query Parameters"
                    />
                    <div className="grid gap-2">
                      <label>Response Template (optional)</label>
                      <Textarea
                        placeholder="{'id': {id}, 'query': {q}}"
                        value={formData.template}
                        onChange={(e) => setFormData({ ...formData, template: e.target.value })}
                        className="h-32"
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              <div className="grid gap-4 mt-4">
                <div className="grid gap-2">
                  <label>Expiration (days)</label>
                  <Input
                    type="number"
                    value={formData.expirationDays}
                    onChange={(e) => setFormData({ ...formData, expirationDays: parseInt(e.target.value) })}
                  />
                </div>
                <Button
                  onClick={createEndpoint}
                  disabled={isCreating || pathAlreadyExist || invalidPath || !formData.path}
                  className="w-full"
                >
                  {isCreating ? 'Creating...' : 'Create Endpoint'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Toaster />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {endpoints.map((endpoint) => (
          <EndpointCard
            key={endpoint._id}
            endpoint={endpoint}
            onDelete={deleteEndpoint}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;