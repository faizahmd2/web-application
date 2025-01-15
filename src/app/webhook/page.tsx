'use client'

import { nanoid } from 'nanoid';
import { useRouter } from 'next/navigation';

export default function CreateWebhook() {
  const router = useRouter();
  
  const createNewWebhook = () => {
    const id = nanoid(10);
    router.push(`/webhook/${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create New Webhook
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Generate a unique webhook URL to capture and view requests
          </p>
        </div>
        <div className="mt-8">
          <button
            onClick={createNewWebhook}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Generate New Webhook
          </button>
        </div>
      </div>
    </div>
  );
}