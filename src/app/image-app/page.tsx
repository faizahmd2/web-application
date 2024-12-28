"use client"

import { useState, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { Search, Download, Share2, Upload } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { UnsplashImage } from './services/types';
import UploadModal from './components/uploadModal';
import ImageModal from './components/ImageModal';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const GalleryPage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState<UnsplashImage | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const { ref, inView } = useInView();
  const [showUploaded, setShowUploaded] = useState(searchParams.get('showUpload') === "true");

  const addQueryParam = (q: string, v: string) => {
    const params = new URLSearchParams(searchParams?.toString());

    params.set(q, v);

    router.push(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const refreshImages = async () => {
    setSearchQuery('');
  };

  const handleImageClick = (image: UnsplashImage) => {
    setIsImageModalOpen(image);
  }

  const onImageModalClose = () => {
    setIsImageModalOpen(null);
  };

  const handleUploadToggle = (checked: boolean) => {
    addQueryParam("showUpload", checked.toString());
    setShowUploaded(checked);
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isError,
    error
  } = useInfiniteQuery({
    queryKey: ['images', debouncedQuery, showUploaded],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams({
        page: pageParam.toString(),
        showUpload: showUploaded.toString(),
        ...(debouncedQuery && { query: debouncedQuery })
      });
      
      const response = await fetch(`/api/image-app/${debouncedQuery ? 'search' : 'random'}?${params}`);
      if (!response.ok) throw new Error('Failed to fetch images');
      return response.json();
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 20 ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage]);

  const handleLike = (imageId: string) => {
    // Implement like functionality
    console.log('Liked:', imageId);
  };

  const handleDownload = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'unsplash-image.jpg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for images..."
              className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <div className="flex items-center space-x-2 mt-3">
            <Checkbox 
              id="uploaded"
              checked={showUploaded}
              onCheckedChange={handleUploadToggle}
              className="h-4 w-4"
            />
            <Label 
              htmlFor="uploaded"
              className="text-sm text-gray-700 cursor-pointer"
            >
              Show only uploaded images
            </Label>
          </div>
          <>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="fixed bottom-6 right-6 p-4 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600"
            >
              <Upload size={24} />
            </button>

            {isUploadModalOpen && 
            <UploadModal
              isOpen={isUploadModalOpen}
              onClose={() => setIsUploadModalOpen(false)}
              onUploadSuccess={refreshImages}
            />}
          </>
        </div>
      </div>

      {/* Popup Image */}
      {isImageModalOpen && <ImageModal isOpen={!!isImageModalOpen} onClose={onImageModalClose} image={isImageModalOpen} />}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {isError && (
          <Alert variant="destructive">
            <AlertDescription>
              {error instanceof Error ? error.message : 'Something went wrong'}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.pages.map((page, pageIndex) =>
            page.map((image: UnsplashImage, imageIndex: number) => (
              <div
                key={`${pageIndex}-${imageIndex}`}
                onClick={()=> handleImageClick(image)}
                className="relative group overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <img
                  src={image.urls.regular}
                  alt={image.alt_description}
                  className="w-full h-64 object-cover"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <div className="flex justify-between items-center text-white">
                      <div className="text-sm">{image.alt_description}</div>
                      <div className="flex space-x-3">
                        {/* <button
                          onClick={() => handleLike(image.id)}
                          className="hover:text-red-500 transition-colors"
                        >
                          <Heart size={20} />
                        </button> */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDownload(image.urls.full)
                          }}
                          className="hover:text-blue-500 transition-colors"
                        >
                          <Download size={20} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            navigator.share({
                              title: image.description || 'Unsplash Image',
                              url: image.urls.full
                            });
                          }}
                          className="hover:text-green-500 transition-colors"
                        >
                          <Share2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-center items-center mt-8">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Infinite scroll trigger */}
        <div ref={ref} className="h-10 mt-4"></div>
      </div>
    </div>
  );
};

export default GalleryPage;