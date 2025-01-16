'use client';

import useSocket from '@/app/hooks/useSocket';
import { useState, useEffect } from 'react';

export default function WebhookContent({ id } : { id: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { socket } = useSocket(id);

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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!id) return <div>Loading...</div>;

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
                onClick={() => copyToClipboard(webhookUrl)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Webhook Data
            </h3>
            {loading ? (
              <div className="mt-4 text-gray-500">Loading...</div>
            ) : error ? (
              <div className="mt-4 text-red-500">{error}</div>
            ) : !data?.lastRequest ? (
              <div className="mt-4 text-gray-500">No requests received yet</div>
            ) : (
              <div className="mt-4">
                <div className="bg-gray-100 p-4 rounded overflow-auto">
                  <pre className="text-sm">
                    {JSON.stringify(data.lastRequest, null, 2)}
                  </pre>
                </div>
                <button
                  onClick={() => copyToClipboard(JSON.stringify(data.lastRequest, null, 2))}
                  className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {copied ? 'Copied!' : 'Copy Response'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}