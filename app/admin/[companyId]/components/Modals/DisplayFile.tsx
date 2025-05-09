import { generateImgUrl } from '@/app/lib/s3';
import React, { useState, useEffect } from 'react';

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

  useEffect(() => {
    const fetchUrl = async () => {
      const url = await generateImgUrl(fileKey, isCheque);
      setUrl(url);
    };
    fetchUrl();
  }, [fileKey, isCheque]);

  return (
    <>
      {fileKey.split('.')[1] === 'pdf' ? (
        <embed src={url} width={width || '100px'} height={height || '100px'} />
      ) : (
        <img
          src={url}
          alt={alt || 'file'}
          style={{
            width: width || '100px',
            height: height || '100px',
            ...style,
          }}
          onClick={onClick}
        />
      )}
    </>
  );
}
