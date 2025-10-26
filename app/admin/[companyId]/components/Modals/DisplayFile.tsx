// import { getLoadUrl } from '@/app/lib/r2';
import { generateImgUrl } from '@/app/lib/s3';
import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import Image from 'next/image';
import ViewImg from '../ViewImg';
import { toCDN } from '@/lib/cdn';

interface IProps {
  fileKey: string;
  alt?: string;
  width?: string | number;
  height?: string | number;
  isCheque?: boolean;
  style?: any;
  isDisableOnClick?: boolean;
  mode?: 'print' | 'view';
}

// const CDN_HOSTS = process.env.NEXT_PUBLIC_CDN_HOSTNAME;

// function isCDNUrl(url: string): boolean {
//   try {
//     const u = new URL(url);
//     return (
//       CDN_HOSTS?.includes(u.hostname) ||
//       u.hostname.endsWith('.cloudfront.net')
//     );
//   } catch {
//     return false;
//   }
// }

function PrintImgWithFallback({
  srcPrimary,
  alt,
  width,
  height,
  style,
  fileKey,
  isCheque,
}: {
  srcPrimary: string;
  alt?: string;
  width?: string | number;
  height?: string | number;
  style?: React.CSSProperties;
  fileKey: string;
  isCheque?: boolean;
}) {
  const [src, setSrc] = useState(srcPrimary);
  const [failedOnce, setFailedOnce] = useState(false);

  const handleError = useCallback(async () => {
    if (failedOnce) return; // avoid loops
    setFailedOnce(true);
    try {
      const signed = generateImgUrl(fileKey, isCheque);
      if (signed) setSrc(signed);
    } catch (e) {
      // last resort: keep src as-is; the browser will show broken image
      console.error('Print fallback failed to generate signed URL', e);
    }
  }, [failedOnce, fileKey, isCheque]);

  return (
    <img
      src={src}
      alt={alt}
      width={Number(width)}
      height={Number(height)}
      loading="eager"
      decoding="sync"
      style={{ objectFit: 'contain', ...style }}
      onError={handleError}
    />
  );
}

export default function DisplayFile({
  fileKey,
  alt,
  width,
  height,
  isCheque,
  style,
  isDisableOnClick = false,
  mode,
}: IProps) {
  if (mode === 'print') {
    // 1) build origin URL from fileKey
    const originUrl = fileKeyToBestGuessUrl(fileKey, isCheque || false);
    // 2) map to CDN exactly once (previous code applied toCDN twice)
    const cdnUrl = toCDN(originUrl, isCheque);

    // Use PrintImgWithFallback to auto-fallback to signed URL on error
    return (
      <PrintImgWithFallback
        srcPrimary={cdnUrl}
        alt={alt}
        width={width}
        height={height}
        style={style}
        fileKey={fileKey}
        isCheque={isCheque}
      />
    );
  }
  const [url, setUrl] = useState('');
  const [isOpenViewImg, setIsOpenViewImg] = useState(false);
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
        const url = generateImgUrl(fileKey, isCheque);
        setUrl(url || '/images/not-found.png');
      } catch (err) {
        console.error(
          'DisplayFile: Failed to generate image URL for fileKey:',
          fileKey,
          'Error:',
          err,
        );
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
      <ViewImg
        fileKeyFront={fileKey}
        open={isOpenViewImg}
        onClose={() => setIsOpenViewImg(false)}
        isCheque={isCheque}
      />
      {fileKey.split('.')[1] === 'pdf' ? (
        <embed src={url} width={width || '100px'} height={height || '100px'} />
      ) : (
        <Image
          src={toCDN(url, isCheque)}
          alt={alt || 'file'}
          style={{
            width: width || '100px',
            height: height || '100px',
            objectFit: 'contain',
            ...style,
          }}
          onClick={() => !isDisableOnClick && setIsOpenViewImg(true)}
          onError={(e) => {
            console.error(
              'DisplayFile: Image failed to load. URL:',
              url,
              'FileKey:',
              fileKey,
              'Event:',
              e,
            );
            setError('Failed to load image');
          }}
          width={100}
          height={100}
          sizes="100vw"
          quality={95}
          unoptimized={true}
        />
      )}
    </>
  );
}

function fileKeyToBestGuessUrl(fileKey: string, isCheque: boolean) {
  return isCheque
    ? `https://cheque-bucket.s3.us-west-2.amazonaws.com/${fileKey}`
    : `https://supreme-sprouts-products.s3.us-west-2.amazonaws.com/${fileKey}`;
}
