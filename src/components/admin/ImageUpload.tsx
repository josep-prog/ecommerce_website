import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface ImageUploadProps {
  onImagesUploaded: (imageUrls: string[]) => void;
  maxFiles?: number;
  existingImages?: string[];
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImagesUploaded,
  maxFiles = 5,
  existingImages = []
}) => {
  const [uploadedImages, setUploadedImages] = useState<string[]>(existingImages);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length + uploadedImages.length > maxFiles) {
      toast.error(`You can only upload up to ${maxFiles} images`);
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    acceptedFiles.forEach(file => {
      formData.append('images', file);
    });

    try {
      console.log('Uploading to:', `${import.meta.env.VITE_API_URL}/api/upload/multiple`);
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/upload/multiple`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        withCredentials: true
      });

      if (response.data && response.data.files) {
        const newImages = response.data.files.map((file: { path: string }) => file.path);
        const updatedImages = [...uploadedImages, ...newImages];
        setUploadedImages(updatedImages);
        onImagesUploaded(updatedImages);
        toast.success('Images uploaded successfully');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error('Error uploading images:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error uploading images';
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  }, [uploadedImages, maxFiles, onImagesUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxSize: 5 * 1024 * 1024 // 5MB
  });

  const removeImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    onImagesUploaded(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Image Preview Grid */}
      {uploadedImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {uploadedImages.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image.startsWith('http') ? image : `${import.meta.env.VITE_API_URL}${image}`}
                alt={`Uploaded ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/150?text=Error';
                }}
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {uploadedImages.length < maxFiles && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500'
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center space-y-2">
            {isUploading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isDragActive
                    ? 'Drop the images here'
                    : 'Drag & drop images here, or click to select'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Max {maxFiles} images, up to 5MB each
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload; 