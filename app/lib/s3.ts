import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  GetObjectCommand,
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
    console.log(fileKey, 'fileKey');

    const params: any = {
      Bucket: isCheque
        ? process.env.NEXT_PUBLIC_S3_BUCKET_NAME_CHEQUE
        : process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
      Key: fileKey,
      Body: await file.arrayBuffer(),
      ContentType: file.type,
    };
    console.log(params, 'params');

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
  }.s3.amazonaws.com/${fileKey}`;
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

      console.log(command, 'command');

      const response: any = await s3.send(command);
      const objects = response.Contents || [];

      const imageFiles = objects
        .map((obj: any) => obj.Key)
        .filter((key: string) => key.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i));

      console.log(imageFiles, 'imageFiles');

      allImages.push(...imageFiles);
      continuationToken = response.NextContinuationToken;
    } while (continuationToken);
    return allImages;
  } catch (error) {
    console.error('Fail to get images from S3: ', error);
  }
};
