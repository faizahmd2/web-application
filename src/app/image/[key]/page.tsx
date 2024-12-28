"use client"

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { getUrlFromImageId } from '@/app/utils/image-url-converter';

interface DownloadState {
  loading: boolean;
  error: string | null;
  imageUrl: string | null;
}

const ImageDownloadPage = () => {
  const router = useParams();
  const { key } = router;
  const [downloadState, setDownloadState] = useState<DownloadState>({
    loading: true,
    error: null,
    imageUrl: null,
  });

  useEffect(() => {
    if (!key || Array.isArray(key)) {
      setDownloadState(prev => ({
        ...prev,
        loading: false,
        error: 'Invalid URL parameter',
      }));
      return;
    }

    try {
      const decodedUrl = getUrlFromImageId(key);
      new URL(decodedUrl);

      setDownloadState({
        loading: false,
        error: null,
        imageUrl: decodedUrl,
      });

      const timer = setTimeout(() => {
        window.location.href = `/api/image/${key}`;
      }, 100);

      return () => clearTimeout(timer);
    } catch (error) {
      console.log("ERR Catched:",error);
      setDownloadState({
        loading: false,
        error: 'Invalid image URL',
        imageUrl: null,
      });
    }
  }, [key]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-2xl p-8 bg-white rounded-lg shadow-lg">
        {downloadState.loading ? (
          <div className="text-center">Loading...</div>
        ) : downloadState.error ? (
          <div className="text-red-500">{downloadState.error}</div>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-4">
              Your download will begin automatically...
            </h1>
            {downloadState.imageUrl && (
              <div className="relative w-full h-[400px]">
                <Image
                  src={downloadState.imageUrl}
                  alt="Downloading image"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ImageDownloadPage;