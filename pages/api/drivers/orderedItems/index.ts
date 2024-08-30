import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import withDriverAuthGuard from '../../utils/withDriverAuthGuar';
import { updateOrderTotalPrice } from '../../admin/orderedItems/PUT';
import { getDriverInfo } from '../../utils/auth';

interface IBody {
  id: number; // ordered item id
  orderId: number;
  quantity: number;
  price: number;
  orderTotalPrice: number;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'PUT') {
      return res.status(404).json({ error: 'Your method is not supported' });
    }

    const prisma = new PrismaClient();
    const { id, orderId, quantity, price, orderTotalPrice } = req.body as IBody;

    const existingOrderedItem = await prisma.orderedItems.findUnique({
      where: {
        id,
      },
    });

    if (!existingOrderedItem) {
      return res.status(404).json({
        error: 'Item Not Found',
      });
    }

    const data = await prisma.orderedItems.update({
      where: {
        id,
      },
      data: {
        quantity,
        price,
      },
    });

    // Get driver update info
    const driverUpdate: any = await getDriverInfo(req, res);

    await updateOrderTotalPrice(
      orderId,
      orderTotalPrice,
      `Driver - ${driverUpdate.name}`,
    );

    return res.status(200).json({
      data,
      message: 'Item Updated Successfully',
    });
  } catch (error) {
    console.log('Internal Server Error: ', error);
  }
};

export default withDriverAuthGuard(handler);
