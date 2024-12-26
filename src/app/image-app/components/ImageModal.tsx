import { Dialog } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { UnsplashImage } from '../services/types';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: UnsplashImage;
}

const ImageModal: React.FC<ImageModalProps> = ({ isOpen, onClose, image }) => {
  if (!image) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
        <div className="relative max-w-7xl max-h-[90vh] overflow-hidden rounded-lg">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-75"
          >
            <X size={24} />
          </button>
          <img
            src={image.urls.full}
            alt={image.alt_description}
            className="max-h-[90vh] w-auto object-contain"
            loading="lazy"
          />
        </div>
      </div>
    </Dialog>
  );
};

export default ImageModal;