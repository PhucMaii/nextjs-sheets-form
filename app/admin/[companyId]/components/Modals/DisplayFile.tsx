// import { getLoadUrl } from '@/app/lib/r2';
import { generateImgUrl } from '@/app/lib/s3';
import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import Image from 'next/image';

interface IProps {
  fileKey: string;
  alt?: string;
  width?: string;
  height?: string;
  isCheque?: boolean;
  style?: any;
  onClick?: () => void;
}

export default function DisplayFile({
  fileKey,
  alt,
  width,
  height,
  isCheque,
  onClick,
  style,
}: IProps) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUrl = async () => {
      if (!fileKey) {
        console.warn('DisplayFile: No file key provided');
        setError('No file key provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const url = await generateImgUrl(fileKey, isCheque);
        setUrl(url || '/images/not-found.png');
      } catch (err) {
        console.error('DisplayFile: Failed to generate image URL for fileKey:', fileKey, 'Error:', err);
        setError('Failed to load image');
        setUrl('/images/not-found.png');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUrl();
  }, [fileKey, isCheque]);

  if (isLoading) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        sx={{
          width: width || '100px',
          height: height || '100px',
          border: '1px dashed #ccc',
          borderRadius: 1,
        }}
      >
        <CircularProgress size={20} />
      </Box>
    );
  }

  if (error || !url) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        sx={{
          width: width || '100px',
          height: height || '100px',
          border: '1px dashed #ccc',
          borderRadius: 1,
          backgroundColor: '#f5f5f5',
        }}
      >
        <Typography variant="caption" color="text.secondary" textAlign="center">
          {error || 'Image not found'}
        </Typography>
      </Box>
    );
  }

  return (
    <>
      {fileKey.split('.')[1] === 'pdf' ? (
        <embed src={url} width={width || '100px'} height={height || '100px'} />
      ) : (
        <Image
          src={url}
          alt={alt || 'file'}
          style={{
            width: width || '100px',
            height: height || '100px',
            objectFit: 'contain',
            ...style,
          }}
          onClick={onClick}
          onError={(e) => {
            console.error('DisplayFile: Image failed to load. URL:', url, 'FileKey:', fileKey, 'Event:', e);
            setError('Failed to load image');
          }}
          width={0}
          height={0}
          sizes="100vw"
          quality={95}
          loading="lazy"
          unoptimized={true}
        />
      )}
    </>
  );
}
