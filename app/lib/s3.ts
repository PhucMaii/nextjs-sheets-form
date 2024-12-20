import AWS from 'aws-sdk';

export async function uploadToS3(file: File, itemName: string) {
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

        const params = {
            Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
            Key: fileKey,
            Body: file,
        };

        const upload = s3.putObject(params).on('httpUploadProgress', (evt) => {
            console.log('upload progress', parseInt(((evt.loaded / evt.total) * 100).toString() + '%'));
        }).promise();

        await upload.then(() => {
            console.log('File uploaded successfully', fileKey);
        });

        return Promise.resolve({
            fileKey,
            fileName: file.name,
            itemName
        });
    } catch (error: any) {
        console.log('Fail to upload file: ', error);
    }
}