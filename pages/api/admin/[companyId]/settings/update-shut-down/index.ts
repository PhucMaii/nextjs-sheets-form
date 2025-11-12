import prisma from '@/client';
import { NextApiRequest, NextApiResponse } from 'next';
import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    const { isShutDown } = req.body;

    const existingSettings = await prisma.settings.findUnique({
      where: { companyId: Number(companyId) },
    });

    if (!existingSettings) {
      const newSettings = await prisma.settings.create({
        data: { companyId: Number(companyId), isShutDown: isShutDown },
      });

      return res
        .status(200)
        .json({ message: 'Settings created successfully', data: newSettings });
    }

    const updatedSettings = await prisma.settings.update({
      where: { companyId: Number(companyId) },
      data: { isShutDown: isShutDown },
    });

    return res.status(200).json({
      message: 'Settings updated successfully',
      data: updatedSettings,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default withAdminAuthGuard(handler);
