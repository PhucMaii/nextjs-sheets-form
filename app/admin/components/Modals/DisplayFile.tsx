import { generateImgUrl } from '@/app/lib/s3';
import React from 'react';

interface IProps {
  fileKey: string;
  alt?: string;
  width?: string;
  height?: string;
}

export default function DisplayFile({ fileKey, alt, width, height }: IProps) {
  return (
    <>
      {fileKey.split('.')[1] === 'pdf' ? (
        <embed src={generateImgUrl(fileKey)} width={width || '100px'} height={height || '100px'} />
      ) : (
        <img
          src={generateImgUrl(fileKey)}
          alt={alt || 'file'}
          style={{ width: width || '100px', height: height || '100px' }}
        />
      )}
    </>
  );
}
