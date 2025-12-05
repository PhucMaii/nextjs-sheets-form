import { s3 } from '@/app/lib/s3';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { NextApiRequest, NextApiResponse } from 'next';
import JSZip from 'jszip';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { files } = req.body;

    if (!files) {
      return res.status(400).json({ error: 'Files are required' });
    }

    const zip = new JSZip();

    for (const file of files) {
      const command = new GetObjectCommand({
        Bucket: file.isCheque
          ? process.env.NEXT_PUBLIC_S3_BUCKET_NAME_CHEQUE
          : process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
        Key: file.fileKey,
      });

      const s3Response = await s3.send(command);

      const bytes = await s3Response.Body?.transformToByteArray();

      const fileName = file.isCheque
        ? `cheque${file.chequeNumber}-${file.user?.clientId}-${file.user?.clientName}`
        : `order${file.order?.id}-${file.order?.user?.clientId}-${file.order?.user?.clientName}`;

      zip.file(fileName + '.jpg', bytes || new Uint8Array());
    }

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="documents.zip"',
    );
    res.setHeader('Content-Length', zipBuffer.length.toString());

    return res.status(200).send(zipBuffer);
  } catch (error) {
    console.log('Something went wrong: ', error);
    return res.status(500).json({ error: 'Something went wrong: ' + error });
  }
};
export default handler;
