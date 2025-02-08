'use client';
import uploadToS3 from '@/app/lib/s3';
import { IInventoryItem } from '@/app/utils/type';
import { AlertColor, Box, LinearProgress, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import { Inbox } from 'lucide-react';
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface IProps {
  showNotification: (type: AlertColor, message: string) => void;
  item: IInventoryItem;
  setPromptedItem: (item: any) => void;
}

export default function FileUpload({
  showNotification,
  item,
  setPromptedItem,
}: IProps) {
  const [uploadingProgress] = useState<number>(0);

  const [isUploading, setIsUploading] = useState<boolean>(false);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'applications/jpeg': ['.jpg', '.jpeg'],
      'applications/png': ['.png'],
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const files = acceptedFiles[0];
      if (files.size > 10 * 1024 * 1024) {
        // Bigger than 10MB
        showNotification('error', 'Please upload a smaller file');
        return;
      }

      try {
        setIsUploading(true);
        console.log('BEFORE ON DROP');
        const data = await uploadToS3(files, item.name);
        if (!data?.fileKey || !data?.fileName) {
          showNotification('error', 'Something went wrong');
          return;
        }

        console.log(data, 'data');
        setPromptedItem((prevState: any) => ({
          ...prevState,
          image: data.fileKey,
        }));
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
