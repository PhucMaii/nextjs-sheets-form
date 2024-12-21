import AWS from 'aws-sdk';

export default async function uploadToS3(file: File, itemName: string, onProgress: any) {
  try {
    AWS.config.update({
      accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY,
    });

    const s3 = new AWS.S3({
      params: {
        Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
      },
      region: 'us-west-2',
    });

    const fileKey = `products/${itemName}/${Date.now()}-${file.name.replace(' ', '-')}`;
    
    if (!process.env.NEXT_PUBLIC_S3_BUCKET_NAME) {
      throw new Error(
        'Missing NEXT_PUBLIC_S3_BUCKET_NAME environment variable',
      );
    }
    
    console.log(fileKey, 'fileKey');
    console.log(s3, 's3');
    const params = {
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
      Key: fileKey,
      Body: file,
    };

    const upload = s3
      .putObject(params)
      .on('httpUploadProgress', (evt) => {
        console.log(
          'upload progress',
          parseInt(((evt.loaded / evt.total) * 100).toString() + '%'),
        );

        if (onProgress) {
          onProgress(parseInt(((evt.loaded / evt.total) * 100).toString() + '%'));
        }
      })
      .promise();

    await upload.then(() => {
      console.log('File uploaded successfully', fileKey);
    });

    return Promise.resolve({
      fileKey,
      fileName: file.name,
      itemName,
    });
  } catch (error: any) {
    console.log('Fail to upload file: ', error);
  }
}

export const generateImgUrl = (fileKey: string) => {
  return `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.amazonaws.com/${fileKey}`
}