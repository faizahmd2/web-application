import React, { useRef, useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { X, Upload, Link, Check } from 'lucide-react';
import { Alert } from '@/components/ui/alert';

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUploadSuccess: () => void;
}


const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUploadSuccess }) => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [tags, setTags] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploadedImageUrl, setUploadedImageUrl] = useState('');
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!file) return;

        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('tags', tags);

            const response = await fetch('/api/image-app/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            setUploadedImageUrl(data.imageUrl);
            onUploadSuccess(); // Refresh the main image listing
        } catch (err) {
            setError('Failed to upload image. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async () => {
        try {
            // await navigator.clipboard.writeText(uploadedImageUrl);
            await (navigator.clipboard as Clipboard).writeText(uploadedImageUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            setError('Failed to copy link');
        }
    };

    const handleClose = () => {
        setFile(null);
        setPreview(null);
        setTags('');
        setUploadedImageUrl('');
        setCopied(false);
        setError('');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
                <div className="bg-white rounded-lg max-w-xl w-full p-6 relative">
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                    >
                        <X size={24} />
                    </button>

                    <h2 className="text-2xl font-bold mb-4">Upload Image</h2>

                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleUpload} className="space-y-4">
                        {!preview ? (
                            <div
                                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="mx-auto mb-4 text-gray-400" size={48} />
                                <p className="text-gray-600">Click or drag image to upload</p>
                                <input
                                    ref={fileInputRef}
                                    id="fileInput"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                            </div>
                        ) : (
                            <div className="relative group">
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="w-full h-64 object-cover rounded-lg"
                                />
                                <div
                                    className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center"
                                    onClick={() => setPreview(null)}
                                >
                                    <p className="text-white">Click to remove</p>
                                </div>
                            </div>
                        )}

                        <input
                            type="text"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="Add tags (comma separated)"
                            className="w-full p-2 border rounded-lg"
                        />

                        {uploadedImageUrl ? (
                            <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                                <input
                                    type="text"
                                    value={uploadedImageUrl}
                                    readOnly
                                    className="flex-1 p-2 bg-transparent"
                                />
                                <button
                                    type="button"
                                    onClick={copyToClipboard}
                                    className="p-2 text-blue-500 hover:text-blue-600"
                                >
                                    {copied ? <Check size={20} /> : <Link size={20} />}
                                </button>
                            </div>
                        ) : (
                            <button
                                type="submit"
                                disabled={!file || loading}
                                className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Uploading...' : 'Upload'}
                            </button>
                        )}
                    </form>
                </div>
            </div>
        </Dialog>
    );
};

export default UploadModal;