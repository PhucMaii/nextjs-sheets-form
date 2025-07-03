import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/client';

interface IQuery {
  id?: string;
}

export default async function DELETE(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { id }: IQuery = req.query;

    if (!id) {
      return res.status(404).json({
        error: 'Item Preference Id Not Provided',
      });
    }

    const existingPreference = await prisma.itemPreference.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!existingPreference) {
      return res.status(404).json({
        error: 'Item Preference Not Found',
      });
    }

    await prisma.itemPreference.delete({
      where: {
        id: existingPreference.id,
      },
    });

    return res.status(200).json({
      message: 'Item Preference Deleted Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
