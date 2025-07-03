import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/client';

interface UpdatedData {
  note?: string;
  shippingFee?: number;
}

interface IBody {
  id: number;
  updatedData: UpdatedData;
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id, updatedData }: IBody = req.body;

    if (Object.keys(updatedData).length === 0) {
      return res.status(404).json({ error: 'You are missing body data' });
    }

    const existingCart = await prisma.cart.findUnique({
      where: {
        id: id,
      },
    });

    if (!existingCart) {
      return res.status(404).json({ error: 'Cart Not Found' });
    }

    const updatedCart = await prisma.cart.update({
      where: {
        id: id,
      },
      data: updatedData,
    });

    return res
      .status(200)
      .json({ message: 'Cart Updated Successfully', data: updatedCart });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
