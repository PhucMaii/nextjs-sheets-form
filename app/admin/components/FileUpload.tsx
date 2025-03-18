'use client';
import uploadToS3 from '@/app/lib/s3';
<<<<<<< HEAD
import { IInventoryItem } from '@/app/utils/type';
=======
>>>>>>> c609e18b7ec18128eeb80dc7226de5d6605fabe7
import { AlertColor, Box, LinearProgress, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import { Inbox } from 'lucide-react';
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface IProps {
  showNotification: (type: AlertColor, message: string) => void;
<<<<<<< HEAD
  item: IInventoryItem;
  setPromptedItem: (item: any) => void;
}

export default function FileUpload({
  showNotification,
  item,
  setPromptedItem,
=======
  fileName: string;
  onUploadImageUI: (fileKey: string) => void;
  uploadLocation: string;
}

export default function FileUpload({
  fileName,
  showNotification,
  onUploadImageUI,
  uploadLocation,
>>>>>>> c609e18b7ec18128eeb80dc7226de5d6605fabe7
}: IProps) {
  const [uploadingProgress] = useState<number>(0);

  const [isUploading, setIsUploading] = useState<boolean>(false);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'applications/jpeg': ['.jpg', '.jpeg'],
      'applications/png': ['.png'],
<<<<<<< HEAD
    },
    maxFiles: 1,
=======
      'applications/pdf': ['.pdf'],
    },
    maxFiles: 4,
>>>>>>> c609e18b7ec18128eeb80dc7226de5d6605fabe7
    onDrop: async (acceptedFiles) => {
      const files = acceptedFiles[0];
      if (files.size > 10 * 1024 * 1024) {
        // Bigger than 10MB
        showNotification('error', 'Please upload a smaller file');
        return;
      }

      try {
        setIsUploading(true);
<<<<<<< HEAD
        console.log('BEFORE ON DROP');
        const data = await uploadToS3(files, item.name);
=======
        const data = await uploadToS3(files, fileName, uploadLocation);
>>>>>>> c609e18b7ec18128eeb80dc7226de5d6605fabe7
        if (!data?.fileKey) {
          showNotification('error', 'Something went wrong');
          return;
        }

        console.log(data, 'data');
<<<<<<< HEAD
        setPromptedItem((prevState: any) => ({
          ...prevState,
          image: data.fileKey,
        }));
=======
        onUploadImageUI(data.fileKey);
>>>>>>> c609e18b7ec18128eeb80dc7226de5d6605fabe7
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
<<<<<<< HEAD
}
=======
}
>>>>>>> c609e18b7ec18128eeb80dc7226de5d6605fabe7
