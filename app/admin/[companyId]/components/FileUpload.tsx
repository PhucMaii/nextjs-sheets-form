'use client';
import { uploadToR2 } from '@/app/lib/r2';
import uploadToS3 from '@/app/lib/s3';
import { AlertColor, Box, LinearProgress, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import { Inbox } from 'lucide-react';
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface IProps {
  showNotification: (type: AlertColor, message: string) => void;
  fileName: string;
  onUploadImageUI: (fileKey: string) => void;
  uploadLocation: string;
  isCheque?: boolean;
}

export default function FileUpload({
  fileName,
  showNotification,
  onUploadImageUI,
  uploadLocation,
  isCheque,
}: IProps) {
  const [uploadingProgress] = useState<number>(0);

  const [isUploading, setIsUploading] = useState<boolean>(false);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'applications/jpeg': ['.jpg', '.jpeg'],
      'applications/png': ['.png'],
      'applications/pdf': ['.pdf'],
    },
    maxFiles: 4,
    onDrop: async (acceptedFiles) => {
      const files = acceptedFiles[0];
      if (files.size > 10 * 1024 * 1024) {
        // Bigger than 10MB
        showNotification('error', 'Please upload a smaller file');
        return;
      }

      try {
        setIsUploading(true);
        let data;
        if (isCheque) {
          data = await uploadToR2(
            files,
            fileName,
            uploadLocation,
            // isCheque,
          );
        } else {
          data = await uploadToS3(
            files,
            fileName,
            uploadLocation,
          );
        }
        
        if (!data?.fileKey) {
          showNotification('error', 'Something went wrong');
          return;
        }

        console.log(data, 'data');
        onUploadImageUI(data.fileKey);
        setIsUploading(false);
        showNotification('success', 'Image uploaded successfully');
      } catch (error) {
        console.log(error);
        setIsUploading(false);
      }
    },
  });

  return (
    <Box
      {...getRootProps()}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      sx={{
        py: 4,
        border: '1px dashed grey',
        borderRadius: 2,
        cursor: 'pointer',
        backgroundColor: grey[100],
      }}
    >
      {isUploading ? (
        <Box sx={{ width: '100%' }}>
          <LinearProgress
            variant="determinate"
            value={uploadingProgress}
            color="primary"
          />
        </Box>
      ) : (
        <>
          <input {...getInputProps()} />
          <Inbox style={{ color: grey[600] }} />
          <Typography variant="body2" sx={{ color: grey[600] }}>
            Drag and drop or click to upload
          </Typography>
        </>
      )}
    </Box>
  );
}
