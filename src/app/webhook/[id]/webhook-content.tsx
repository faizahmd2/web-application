'use client';

import useSocket from '@/app/hooks/useSocket';
import { useState, useEffect } from 'react';

export default function WebhookContent({ id } : { id: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copyUrl, setCopyUrl] = useState(false);
  const [copyWebhookAllData, setCopyWebhookAllData] = useState(false);
  const [copyBodyData, setCopyBodyData] = useState(false);
  const [copyQueryData, setCopyQueryData] = useState(false);
  const { socket } = useSocket(id);
  const [isMinifiedView, setIsMinifiedView] = useState(false);

  const webhookUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhook/${id}`;

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/webhook/details/${id}`);
      if (!response.ok) throw new Error('Failed to fetch data');
      const json = await response.json();
      setData(json);
      setError(null);
    } catch (err) {
      setError('Error fetching webhook data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
      if(socket) socket.on('code-update', (data: any) => {
        fetchData();
      });
  }, [socket]);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const toggleView = () => {
    setIsMinifiedView(!isMinifiedView);
  };

  const copyToClipboard = async (text: string, setter: (val: boolean)=> void) => {
    try {
      await navigator.clipboard.writeText(text);
      setter(true);
      setTimeout(() => setter(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!id) return <div>Loading...</div>;

  let bodyData: any = {}, queryData: any = {};
  if(data && data.lastRequest) {
    bodyData = data.lastRequest.body;
    queryData = data.lastRequest.query;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Webhook URL
            </h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>Send POST requests to this URL:</p>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <code className="flex-1 p-2 bg-gray-100 rounded">{webhookUrl}</code>
              <button
                onClick={() => copyToClipboard(webhookUrl, setCopyUrl)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {copyUrl ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-3 bg-white shadow sm:rounded-lg">
          <div className="px-4 py-3 sm:p-6">
            {loading ? (
              <div className="mt-4 text-gray-500">Loading...</div>
            ) : error ? (
              <div className="mt-2 text-red-500">{error}</div>
            ) : !data?.lastRequest ? (
              <div className="mt-2 text-gray-500">No requests received yet</div>
            ) : (
              <div>
                <div className="flex justify-between items-center">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Webhook Data
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={toggleView}
                      className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      {isMinifiedView ? "Beautified View" : "Minified View"}
                    </button>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(data.lastRequest, null, isMinifiedView ? 0 : 2), setCopyWebhookAllData)}
                      className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      {copyWebhookAllData ? "Copied!" : "Copy All"}
                    </button>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(bodyData), setCopyBodyData)}
                      className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      {copyBodyData ? "Copied!" : "Copy Body Data"}
                    </button>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(queryData), setCopyQueryData)}
                      className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      {copyQueryData ? "Copied!" : "Copy Query Params"}
                    </button>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
                    <pre
                      className={`text-sm bg-white p-2 rounded border border-gray-300 ${
                        isMinifiedView ? "whitespace-pre-wrap" : "whitespace-pre-wrap"
                      }`}
                    >
                      {isMinifiedView
                        ? JSON.stringify(data.lastRequest)
                        : JSON.stringify(data.lastRequest, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}