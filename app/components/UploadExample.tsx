'use client'

import React, { useState } from 'react'
import { PresignedFileUpload } from './PresignedFileUpload'

export const UploadExample: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ fileKey: string; fileName: string }>>([])
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleUploadComplete = (files: Array<{ fileKey: string; fileName: string }>) => {
    setUploadedFiles(files)
    setUploadError(null)
    console.log('Upload completed:', files)
  }

  const handleUploadError = (error: string) => {
    setUploadError(error)
    console.error('Upload error:', error)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Pre-signed URL File Upload
        </h1>
        <p className="text-gray-600">
          Upload files directly to S3 using pre-signed URLs for faster and more secure uploads.
        </p>
      </div>

      {/* General File Upload */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">General File Upload</h2>
        <PresignedFileUpload
          location="uploads/general"
          maxFiles={3}
          maxSize={5 * 1024 * 1024} // 5MB
          acceptedFileTypes={['image/*', 'application/pdf', 'text/*']}
          onUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
        />
      </div>

      {/* Image Upload Only */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Image Upload Only</h2>
        <PresignedFileUpload
          location="uploads/images"
          maxFiles={5}
          maxSize={2 * 1024 * 1024} // 2MB
          acceptedFileTypes={['image/*']}
          onUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
        />
      </div>

      {/* Cheque Upload */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Cheque Upload</h2>
        <PresignedFileUpload
          location="uploads/cheques"
          isCheque={true}
          maxFiles={1}
          maxSize={10 * 1024 * 1024} // 10MB
          acceptedFileTypes={['image/*', 'application/pdf']}
          onUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
        />
      </div>

      {/* Upload Results */}
      {uploadedFiles.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload Results</h2>
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-800">{file.fileName}</p>
                  <p className="text-sm text-gray-500">Key: {file.fileKey}</p>
                </div>
                <span className="text-green-600 text-sm font-medium">✓ Uploaded</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Display */}
      {uploadError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-red-600 mr-2">⚠️</span>
            <p className="text-red-700">{uploadError}</p>
            <button
              onClick={() => setUploadError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Usage Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">How it works:</h3>
        <ol className="list-decimal list-inside space-y-2 text-blue-700">
          <li>Select or drag files to the upload area</li>
          <li>The system generates a pre-signed URL for each file</li>
          <li>Files are uploaded directly to S3 using the pre-signed URL</li>
          <li>Progress is tracked and displayed in real-time</li>
          <li>Uploaded file information is returned upon completion</li>
        </ol>
        
        <div className="mt-4 p-4 bg-white rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Benefits:</h4>
          <ul className="list-disc list-inside space-y-1 text-blue-700 text-sm">
            <li>Faster uploads (direct to S3, bypassing your server)</li>
            <li>Reduced server load and bandwidth usage</li>
            <li>Better security (temporary, signed URLs)</li>
            <li>Real-time progress tracking</li>
            <li>Support for large files</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 