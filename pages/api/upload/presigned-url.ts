import { NextApiRequest, NextApiResponse } from 'next';
import { generatePresignedUploadUrl } from '../../../app/lib/s3';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fileName, fileType, location, isCheque, expiresIn } = req.body;

    // Validate required fields
    if (!fileName || !fileType || !location) {
      return res.status(400).json({
        error: 'Missing required fields: fileName, fileType, location',
      });
    }

    // Generate pre-signed URL
    const result = await generatePresignedUploadUrl(
      fileName,
      fileType,
      location,
      isCheque || false,
      expiresIn || 3600,
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error('Something went wrong generating presigned URL:', error);
    return res.status(500).json({
      error: 'Failed to generate presigned URL',
    });
  }
}
