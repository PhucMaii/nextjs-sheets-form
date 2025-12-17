import { s3 } from '@/app/lib/s3';
import prisma from '@/client';
import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { isCheque, fileId } = req.query;

    if (!fileId) {
      return res.status(400).json({ error: 'File ID is required' });
    }

    let fileName = '';
    let fileKey = '';

    if (isCheque === 'true') {
      const cheque = await prisma.cheque.findUnique({
        where: {
          id: Number(fileId),
        },
        include: {
          user: true,
          vendor: true,
        },
      });
      fileName = `cheque${cheque?.chequeNumber}-${cheque?.user?.clientId}-${cheque?.user?.clientName}`;
      fileKey = cheque?.fileKeyFront || '';
    } else {
      const file = await prisma.media.findUnique({
        where: {
          id: Number(fileId),
        },
        include: {
          delivery: {
            include: {
              order: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      });

      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }

      fileName = `order${file?.delivery?.order?.id}-${file?.delivery?.order?.user?.clientId}-${file?.delivery?.order?.user?.clientName}`;
      fileKey = file?.fileKey;
    }

    const key = decodeURIComponent(fileKey);
    const command = new GetObjectCommand({
      Bucket:
        isCheque === 'true'
          ? process.env.NEXT_PUBLIC_S3_BUCKET_NAME_CHEQUE
          : process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
      Key: key,
      ResponseContentDisposition: `attachment; filename="${fileName}"`,
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });

    return res.status(200).json({ url });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default withAdminAuthGuard(handler);
