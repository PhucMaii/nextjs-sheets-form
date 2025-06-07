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

export async function uploadToR2Light(
  file: File,
  name: string,
  location: string,
) {
  const fileKey = `${location}/${name}/${Date.now()}-${file.name.replace(/\s/g, '-')}`;

  const uploadUrl = `https://pub-6dbcecc260434d6da02a3167f04a9891.r2.dev/${process.env.NEXT_PUBLIC_R2_BUCKET_NAME}/${fileKey}`;
  console.log(uploadUrl, 'uploadUrl');
  try {
    const res = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
        // 'x-amz-acl': 'public-read', // optional depending on config
      },
      body: file,
    });

    if (!res.ok) throw new Error('Upload failed');

    return { fileKey, fileName: file.name, name };
  } catch (err) {
    console.error('upload error', err);
    throw err;
  }
}

export async function getSignedUploadUrl(fileKey: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: process.env.NEXT_PUBLIC_R2_BUCKET_NAME!,
    Key: fileKey,
    ContentType: contentType,
  });

  const url = await getSignedUrl(r2Client, command, { expiresIn: 300 }); // 5 min
  return url;
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
