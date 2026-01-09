import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/client';
import { getCreatedBy } from '@/pages/api/import-sheets/utils';
import { getTodayDate } from '@/pages/api/utils/date';
import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';

interface IQuery {
  driverId?: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'PUT') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { driverId }: IQuery = req.query;

    if (!driverId) {
      return res.status(404).json({ error: 'Driver ID is required' });
    }

    const driver = await prisma.employee.findUnique({
      where: { id: Number(driverId) },
    });

    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    const createdBy = await getCreatedBy(req, res);
    const today = getTodayDate();

    await prisma.employee.update({
      where: { id: Number(driverId) },
      data: {
        isDeleted: true,
        deletedAt: today.dateAndTime,
        deletedBy: createdBy,
      },
    });

    return res.status(200).json({ message: 'Driver deleted successfully' });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
};

export default withAdminAuthGuard(handler, true)
