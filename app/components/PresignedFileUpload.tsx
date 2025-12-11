'use client';

import React, { Dispatch, SetStateAction, useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { usePresignedUpload } from '../../hooks/usePresignedUpload';
import { generateImgUrl } from '../lib/s3';

interface PresignedFileUploadProps {
  location: string;
  isCheque?: boolean;
  maxFiles?: number;
  maxSize?: number;
  acceptedFileTypes?: string[];
  handleFlagUpload?: Dispatch<SetStateAction<boolean>>;
  onUploadComplete?: (
    uploadedFiles: Array<{
      fileKey: string;
      fileName: string;
      fileType: string;
    }>,
    imgUrl: string,
  ) => void;
  onUploadError?: (error: string) => void;
  className?: string;
  isUploaded?: boolean;
  disabled?: boolean;
}

export const PresignedFileUpload: React.FC<PresignedFileUploadProps> = ({
  location,
  isCheque = false,
  maxFiles = 1,
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedFileTypes = ['image/*', 'application/pdf'],
  handleFlagUpload,
  onUploadComplete,
  onUploadError,
  className = '',
  isUploaded = false,
  disabled = false,
}) => {
  const [isGeneratingUrl, setIsGeneratingUrl] = useState(false);
  const {
    isUploading,
    progress,
    error,
    uploadedFiles,
    uploadFile,
    clearError,
  } = usePresignedUpload();

  const generatePresignedUrl = useCallback(
    async (file: File) => {
      try {
        setIsGeneratingUrl(true);
        clearError();

        const response = await fetch('/api/upload/presigned-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            location,
            isCheque,
            expiresIn: 3600,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || 'Failed to generate presigned URL',
          );
        }

        const { presignedUrl, fileKey } = await response.json();
        return { presignedUrl, fileKey };
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to generate presigned URL';
        console.error('Error generating presigned URL:', error);
        onUploadError?.(errorMessage);
        throw error;
      } finally {
        setIsGeneratingUrl(false);
      }
    },
    [location, isCheque, clearError, onUploadError],
  );

  const handleFileUpload = useCallback(
    async (acceptedFiles: File[]) => {
      try {
        clearError();
        handleFlagUpload?.(true);

        const files = [];
        for (const file of acceptedFiles) {
          const { presignedUrl, fileKey } = await generatePresignedUrl(file);
          console.log('Generated presigned URL with fileKey:', fileKey);
          await uploadFile(file, presignedUrl, fileKey);
          files.push({
            fileKey: fileKey,
            fileName: file.name,
            fileType: file.type,
          });
        }

        const imgUrl = generateImgUrl(files[0].fileKey);
        onUploadComplete?.(files as any, imgUrl);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Upload failed';
        console.error('Upload error:', error);
        onUploadError?.(errorMessage);
      } finally {
        handleFlagUpload?.(false);
      }
    },
    [
      generatePresignedUrl,
      uploadFile,
      uploadedFiles,
      clearError,
      onUploadComplete,
      onUploadError,
    ],
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      handleFileUpload(acceptedFiles);
    },
    [handleFileUpload],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    maxSize,
    accept: acceptedFileTypes.reduce(
      (acc, type) => {
        acc[type] = [];
        return acc;
      },
      {} as Record<string, string[]>,
    ),
    disabled: isUploaded || disabled,
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${
            isUploaded || disabled
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
              : isDragActive
                ? 'border-blue-500 bg-blue-50 cursor-pointer'
                : 'border-gray-300 hover:border-gray-400 cursor-pointer'
          }
          ${isUploading || isGeneratingUrl ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          {...getInputProps()}
          disabled={isUploaded || isUploading || isGeneratingUrl || disabled}
        />

        <div className="space-y-4">
          <div className="text-6xl text-gray-400">📁</div>

          {isUploaded ? (
            <div>
              <p className="text-lg font-medium text-gray-500">
                Files already uploaded
              </p>
              <p className="text-sm text-gray-400 mt-2">Upload is complete</p>
            </div>
          ) : isDragActive ? (
            <p className="text-lg font-medium text-blue-600">
              Drop the files here...
            </p>
          ) : (
            <div>
              <p className="text-lg font-medium text-gray-700">
                Drag & drop files here, or click to select files
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Max {maxFiles} files, up to {formatFileSize(maxSize)} each
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Supported: {acceptedFileTypes.join(', ')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {(isUploading || isGeneratingUrl) && (
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>
              {isGeneratingUrl ? 'Generating upload URL...' : 'Uploading...'}
            </span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-red-600 mr-2">⚠️</span>
            <p className="text-red-700 text-sm">{error}</p>
            <button
              onClick={clearError}
              className="ml-auto text-red-500 hover:text-red-700 text-sm"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Uploaded Files:
          </h3>
          <div className="space-y-2">
            {/* {uploadedFiles.map((file, index) => ( */}
            {uploadedFiles && uploadedFiles.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-sm text-gray-700">
                    {uploadedFiles[uploadedFiles.length - 1].fileName}
                  </span>
                </div>
                <span className="text-xs text-green-600">Uploaded</span>
              </div>
            )}
            {/* ))} */}
          </div>
        </div>
      )}
    </div>
  );
};
