import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/client';
interface IQuery {
  companyId?: string;
  id?: string;
}

export default async function DELETE(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { companyId, id } = req.query as IQuery;

    const existingShift = await prisma.scheduledShift.findUnique({
      where: {
        id: Number(id),
        companyId: Number(companyId),
      },
    });

    if (!existingShift) {
      return res.status(404).json({ error: 'Shift not found' });
    }

    await prisma.scheduledShift.delete({
      where: { id: Number(id) },
    });
    
    return res.status(200).json({ message: 'Shift deleted successfully' });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}