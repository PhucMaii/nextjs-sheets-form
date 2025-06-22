import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';

import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
  region: 'us-west-2',
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY || '',
  },
});

export default async function uploadToS3(
  file: File,
  name: string,
  location: string,
  isCheque: boolean = false,
) {
  try {
    if (
      !process.env.NEXT_PUBLIC_S3_BUCKET_NAME ||
      !process.env.NEXT_PUBLIC_S3_BUCKET_NAME_CHEQUE
    ) {
      throw new Error(
        'Missing NEXT_PUBLIC_S3_BUCKET_NAME environment variable',
      );
    }

    const fileKey = `${location}/${name}/${Date.now()}-${file.name.replace(/\s/g, '-')}`;

    const params: any = {
      Bucket: isCheque
        ? process.env.NEXT_PUBLIC_S3_BUCKET_NAME_CHEQUE
        : process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
      Key: fileKey,
      Body: await file.arrayBuffer(),
      ContentType: file.type,
    };

    const command = new PutObjectCommand(params);
    await s3.send(command);
    console.log('File uploaded successfully', fileKey);

    return { fileKey, fileName: file.name, name };
  } catch (error) {
    console.error('Fail to upload file: ', error);
  }
}

export const generateImgUrl = async (
  fileKey: string,
  isCheque: boolean = false,
) => {
  if (!fileKey) return '';

  if (isCheque) {
    const command = new GetObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME_CHEQUE,
      Key: fileKey,
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    return signedUrl;
  }

  return `https://${
    isCheque
      ? process.env.NEXT_PUBLIC_S3_BUCKET_NAME_CHEQUE
      : process.env.NEXT_PUBLIC_S3_BUCKET_NAME
  }.s3.us-west-2.amazonaws.com/${fileKey}`;
};

export const getAllS3Images = async (folder: string = '') => {
  const allImages = [];
  let continuationToken;
  try {
    do {
      const command: any = new ListObjectsV2Command({
        Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
        ContinuationToken: continuationToken,
        Prefix: folder,
      });

      const response: any = await s3.send(command);
      const objects = response.Contents || [];

      const imageFiles = objects
        .map((obj: any) => obj.Key)
        .filter((key: string) => key.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i));

      allImages.push(...imageFiles);
      continuationToken = response.NextContinuationToken;
    } while (continuationToken);
    return allImages;
  } catch (error) {
    console.error('Fail to get images from S3: ', error);
  }
};

/**
 * Generate a pre-signed URL for uploading a file directly to S3
 * @param fileName - The name of the file to upload
 * @param fileType - The MIME type of the file
 * @param location - The folder location in S3
 * @param isCheque - Whether to use the cheque bucket
 * @param expiresIn - URL expiration time in seconds (default: 3600)
 * @returns Object containing the pre-signed URL and file key
 */
export const generatePresignedUploadUrl = async (
  fileName: string,
  fileType: string,
  location: string,
  isCheque: boolean = false,
  expiresIn: number = 3600,
) => {
  try {
    if (
      !process.env.NEXT_PUBLIC_S3_BUCKET_NAME ||
      !process.env.NEXT_PUBLIC_S3_BUCKET_NAME_CHEQUE
    ) {
      throw new Error(
        'Missing NEXT_PUBLIC_S3_BUCKET_NAME environment variable',
      );
    }

    const fileKey = `${location}/${Date.now()}-${fileName.replace(/\s/g, '-')}`;
    const bucketName = isCheque
      ? process.env.NEXT_PUBLIC_S3_BUCKET_NAME_CHEQUE
      : process.env.NEXT_PUBLIC_S3_BUCKET_NAME;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      ContentType: fileType,
    });

    const presignedUrl = await getSignedUrl(s3, command, { expiresIn });

    return {
      presignedUrl,
      fileKey,
      fileName,
      bucketName,
    };
  } catch (error) {
    console.error('Failed to generate presigned upload URL:', error);
    throw error;
  }
};

/**
 * Generate a pre-signed URL for downloading a file from S3
 * @param fileKey - The S3 key of the file
 * @param isCheque - Whether to use the cheque bucket
 * @param expiresIn - URL expiration time in seconds (default: 3600)
 * @returns The pre-signed download URL
 */
export const generatePresignedDownloadUrl = async (
  fileKey: string,
  isCheque: boolean = false,
  expiresIn: number = 3600,
) => {
  try {
    if (!fileKey) {
      throw new Error('File key is required');
    }

    const bucketName = isCheque
      ? process.env.NEXT_PUBLIC_S3_BUCKET_NAME_CHEQUE
      : process.env.NEXT_PUBLIC_S3_BUCKET_NAME;

    if (!bucketName) {
      throw new Error('Missing bucket name environment variable');
    }

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
    });

    const presignedUrl = await getSignedUrl(s3, command, { expiresIn });

    return presignedUrl;
  } catch (error) {
    console.error('Failed to generate presigned download URL:', error);
    throw error;
  }
};

/**
 * Upload file directly to S3 using a pre-signed URL
 * @param file - The file to upload
 * @param presignedUrl - The pre-signed URL for upload
 * @param onProgress - Optional progress callback
 * @returns Promise that resolves when upload is complete
 */
export const uploadFileWithPresignedUrl = async (
  file: File,
  presignedUrl: string,
  onProgress?: (progress: number) => void,
): Promise<void> => {
  try {
    const xhr = new XMLHttpRequest();

    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status: ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.open('PUT', presignedUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    });
  } catch (error) {
    console.error('Failed to upload file with presigned URL:', error);
    throw error;
  }
};

/**
 * Upload file using fetch API with pre-signed URL (alternative method)
 * @param file - The file to upload
 * @param presignedUrl - The pre-signed URL for upload
 * @returns Promise that resolves when upload is complete
 */
export const uploadFileWithFetch = async (
  file: File,
  presignedUrl: string,
): Promise<void> => {
  try {
    const response = await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }
  } catch (error) {
    console.error('Failed to upload file with fetch:', error);
    throw error;
  }
};
