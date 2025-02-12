import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import withDriverAuthGuard from '../../utils/withDriverAuthGuar';
import { getDriverInfo } from '../../utils/auth';
import { generateCostAndProfit, updateSingleInventoryItem } from '../../admin/orderedItems/single';
import { generateOrderTotalPrice } from '../../admin/orderedItems/PUT';

interface IBody {
  id: number; // ordered item id
  orderId: number;
  quantity: number;
  price: number;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'PUT') {
      return res.status(404).json({ error: 'Your method is not supported' });
    }

    const prisma = new PrismaClient();
    const { id, orderId, quantity, price } = req.body as IBody;

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

    const { cost } = await generateCostAndProfit(id); 

    const updatedOrderedItem = await prisma.orderedItems.update({
      where: {
        id,
      },
      data: {
        quantity,
        price,
        cost,
        profit: price - cost,
      },
      include: {
        fifo: true,
        inventoryUnit: true,
      },
    });

    // Update Inventory Item Quantity
    if (updatedOrderedItem?.fifo && updatedOrderedItem?.inventoryUnit) {
      await updateSingleInventoryItem(
        orderId,
        updatedOrderedItem.fifo,
        updatedOrderedItem.inventoryUnit,
        updatedOrderedItem.quantity,
        existingOrderedItem.quantity,
      );
    }

    // Get driver update info
    const driverUpdate: any = await getDriverInfo(req, res);
    const updatedAt = new Date();

    const orderedItems = await prisma.orderedItems.findMany({
      where: {
        orderId,
      },
      include: {
        fifo: true,
        inventoryItem: true,
        inventoryUnit: true,
      },
    });

    const orderTotalPrice = generateOrderTotalPrice(orderedItems);

    await prisma.orders.update({
      where: {
        id: orderId,
      },
      data: {
        totalPrice: orderTotalPrice.totalPrice,
        subTotal: orderTotalPrice.subTotal,
        PST: orderTotalPrice.PST,
        GST: orderTotalPrice.GST,
        discount: orderTotalPrice.discount,
        updatedBy: `Driver - ${driverUpdate.name}`,
        updateTime: updatedAt,
      },
    });
    // await updateOrderTotalPrice(
    //   orderId,
    //   orderTotalPrice,
    //   `Driver - ${driverUpdate.name}`,
    // );

    return res.status(200).json({
      data: updatedOrderedItem,
      message: 'Item Updated Successfully',
    });
  } catch (error) {
    console.log('Internal Server Error: ', error);
  }
};

export default withDriverAuthGuard(handler);
