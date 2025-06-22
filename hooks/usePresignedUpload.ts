import { useState, useCallback } from 'react';
import { uploadFileWithPresignedUrl, uploadFileWithFetch } from '../app/lib/s3';

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  uploadedFiles: Array<{
    fileKey: string;
    fileName: string;
    presignedUrl: string;
  }>;
}

interface UsePresignedUploadReturn extends UploadState {
  uploadFile: (
    file: File,
    presignedUrl: string,
    useFetch?: boolean,
  ) => Promise<{ fileKey: string; fileName: string; presignedUrl: string }>;
  resetUpload: () => void;
  clearError: () => void;
  uploadedFiles: Array<{
    fileKey: string;
    fileName: string;
    presignedUrl: string;
  }>;
}

export const usePresignedUpload = (): UsePresignedUploadReturn => {
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    uploadedFiles: [],
  });

  const uploadFile = useCallback(
    async (
      file: File,
      presignedUrl: string,
      useFetch: boolean = false,
    ): Promise<{ fileKey: string; fileName: string; presignedUrl: string }> => {
      setState((prev) => ({
        ...prev,
        isUploading: true,
        progress: 0,
        error: null,
      }));

      try {
        const onProgress = (progress: number) => {
          setState((prev) => ({
            ...prev,
            progress,
          }));
        };

        if (useFetch) {
          await uploadFileWithFetch(file, presignedUrl);
        } else {
          await uploadFileWithPresignedUrl(file, presignedUrl, onProgress);
        }

        setState((prev) => ({
          ...prev,
          isUploading: false,
          progress: 100,
          uploadedFiles: [
            ...prev.uploadedFiles,
            {
              fileKey: `${Date.now()}-${file.name}`,
              fileName: file.name,
              presignedUrl,
            },
          ],
        }));

        return {
          fileKey: `${Date.now()}-${file.name}`,
          fileName: file.name,
          presignedUrl,
        };
      } catch (error) {
        console.error('Upload failed:', error);
        setState((prev) => ({
          ...prev,
          isUploading: false,
          error: error instanceof Error ? error.message : 'Upload failed',
        }));
        throw error;
      }
    },
    [],
  );

  const resetUpload = useCallback(() => {
    setState({
      isUploading: false,
      progress: 0,
      error: null,
      uploadedFiles: [],
    });
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
    }));
  }, []);

  console.log(state, 'state');

  return {
    ...state,
    uploadFile,
    resetUpload,
    clearError,
  };
};
