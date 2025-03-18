import { generateImgUrl } from '@/app/lib/s3';
import React from 'react';

interface IProps {
  fileKey: string;
}

export default function DisplayFile({ fileKey }: IProps) {
  return (
    <>
      {fileKey.split('.')[1] === 'pdf' ? (
        <embed src={generateImgUrl(fileKey)} width="100px" height="100px" />
      ) : (
        <img
          src={generateImgUrl(fileKey)}
          alt="cheque"
          style={{ width: '100px', height: '100px' }}
        />
      )}
    </>
  );
}
