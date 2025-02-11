// import AWS from 'aws-sdk';
// import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';

// const s3 = new S3Client({
//   region: 'us-west-2',
//   credentials: {
//     accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID || '',
//     secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY || '',
//   },
// });

// export default async function uploadToS3(
//   file: File,
//   itemName: string,
//   onProgress: any,
// ) {
//   try {
//     AWS.config.update({
//       accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID,
//       secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY,
//     });

//     const s3 = new AWS.S3({
//       params: {
//         Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
//       },
//       region: 'us-west-2',
//     });

//     const fileKey = `products/${itemName}/${Date.now()}-${file.name.replace(' ', '-')}`;

//     if (!process.env.NEXT_PUBLIC_S3_BUCKET_NAME) {
//       throw new Error(
//         'Missing NEXT_PUBLIC_S3_BUCKET_NAME environment variable',
//       );
//     }

//     console.log(fileKey, 'fileKey');
//     console.log(s3, 's3');
//     const params = {
//       Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
//       Key: fileKey,
//       Body: file,
//     };

//     const upload = s3
//       .putObject(params)
//       .on('httpUploadProgress', (evt) => {
//         console.log(
//           'upload progress',
//           parseInt(((evt.loaded / evt.total) * 100).toString() + '%'),
//         );

//         if (onProgress) {
//           onProgress(
//             parseInt(((evt.loaded / evt.total) * 100).toString() + '%'),
//           );
//         }
//       })
//       .promise();

//     await upload.then(() => {
//       console.log('File uploaded successfully', fileKey);
//     });

//     return Promise.resolve({
//       fileKey,
//       fileName: file.name,
//       itemName,
//     });
//   } catch (error: any) {
//     console.log('Fail to upload file: ', error);
//   }
// }

// export const generateImgUrl = (fileKey: string) => {
//   return `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.amazonaws.com/${fileKey}`;
// };

// export const getAllS3Images = async () => {
//   const allImages: string[] = [];
//   let continuationToken = undefined;
//   try {
//     do {
//       // Command to retrive all images from bucket
//       const command: any = new ListObjectsV2Command({
//         Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
//         ContinuationToken: continuationToken,
//       });

//       console.log(command, 'command');

//       const response: any = await s3.send(command);
//       const objects = response.Contents || [];

//       // Filter files with common image extensions
//       const imageFiles = objects
//         .map((obj: any) => obj.Key)
//         .filter((key: string) => key.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i));

//       allImages.push(...imageFiles);
//       continuationToken = response.NextContinuationToken;
//     } while (continuationToken);

//     console.log(allImages);
//     return allImages;
//   } catch (error: any) {
//     console.log('Fail to get images from S3: ', error);
//   }
// };

import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: 'us-west-2',
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY || '',
  },
});

export default async function uploadToS3(file: File, itemName: string) {
  try {
    if (!process.env.NEXT_PUBLIC_S3_BUCKET_NAME) {
      throw new Error(
        'Missing NEXT_PUBLIC_S3_BUCKET_NAME environment variable',
      );
    }

    const fileKey = `products/${itemName}/${Date.now()}-${file.name.replace(/\s/g, '-')}`;
    console.log(fileKey, 'fileKey');

    const params = {
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
      Key: fileKey,
      Body: file,
    };

    const command = new PutObjectCommand(params);
    await s3.send(command);
    console.log('File uploaded successfully', fileKey);

    return { fileKey, fileName: file.name, itemName };
  } catch (error) {
    console.error('Fail to upload file: ', error);
  }
}

export const generateImgUrl = (fileKey: string) => {
  return `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.amazonaws.com/${fileKey}`;
};

export const getAllS3Images = async () => {
  const allImages = [];
  let continuationToken;
  try {
    do {
      const command: any = new ListObjectsV2Command({
        Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
        ContinuationToken: continuationToken,
      });

      const response: any = await s3.send(command);
      const objects = response.Contents || [];

      const imageFiles = objects
        .map((obj: any) => obj.Key)
        .filter((key: string) => key.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i));

      allImages.push(...imageFiles);
      continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    console.log(allImages);
    return allImages;
  } catch (error) {
    console.error('Fail to get images from S3: ', error);
  }
};
