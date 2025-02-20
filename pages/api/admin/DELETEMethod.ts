import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IQuery {
  id?: string;
}

export default async function DELETE(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const prisma = new PrismaClient();

    const { id }: IQuery = req.query;

    if (!id) {
      return res.status(404).json({
        error: 'You are missing driver id',
      });
    }

    const existingAdmin = await prisma.user.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!existingAdmin) {
      return res.status(404).json({
        error: 'Admin Not Found',
      });
    }

    await prisma.user.delete({
      where: {
        id: existingAdmin.id,
      },
    });

    return res.status(200).json({
      message: 'Admin deleted successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
