// import AWS from 'aws-sdk';
import {
  GetObjectCommand,
  // PutObjectAclCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const r2Client = new S3Client({
  region: 'us-east-1',
  endpoint: process.env.NEXT_PUBLIC_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_R2_ACCESS_KEY!,
    secretAccessKey: process.env.NEXT_PUBLIC_R2_SECRET_KEY!,
  },
}) as any;

export async function uploadToR2(file: File, name: string, location: string) {
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileKey = `${location}/${name}/${Date.now()}-${file.name.replace(/\s/g, '-')}`;

    const putObjectCommand = new PutObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_R2_BUCKET_NAME,
      Key: fileKey,
      Body: buffer,
      ContentType: file.type,
    });

    await r2Client.send(putObjectCommand);

    return Promise.resolve({ fileKey, fileName: file.name, name });
  } catch (error) {
    console.log('error uploading to s3', error);
  }
}

export const getLoadUrl = async (fileKey: string) => {
  const command = new GetObjectCommand({
    Bucket: process.env.NEXT_PUBLIC_R2_BUCKET_NAME,
    Key: fileKey,
    ResponseContentType: 'application/octet-stream',
  });

  const signedUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });
  return signedUrl;
};
