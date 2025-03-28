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
        error: 'Option Id Not Provided',
      });
    }

    const existingOption = await prisma.option.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!existingOption) {
      return res.status(404).json({
        error: 'Option Not Found',
      });
    }

    // Handle Scheduled OrderedItems have deleted option
    // Check if this option is the final option in the item
    const item = await prisma.item.findUnique({
      where: {
        id: existingOption.itemId,
      },
      include: {
        options: {
            include: {
                unit: true,
            },
        },
      },
    });

    if (!item) {
      return res.status(400).json({
        error: 'Conflict item not found',
      });
    }

    if (item?.options.length === 1) {
      // Remove options in scheduledOrderedItems related
      await prisma.orderedItems.updateMany({
        where: {
          ScheduleOrders: {
            user: {
              categoryId: item.categoryId,
            },
          },
          name: item.name,
        },
        data: {
          price: item?.price,
          inventoryUnitId: item?.inventoryUnitId,
          prevPrice: item?.prevPrice,
          isShowDiscount: item?.isShowDiscount,
          option: {
            name: '',
            price: 0,
            ratio: 1,
          },
        },
      });
    } else {
      // Move item option to another option
      const otherOptions = item.options.filter(
        (option) => option.id !== existingOption.id,
      );

      const tmpOption = otherOptions[0];

      await prisma.orderedItems.updateMany({
        where: {
          ScheduleOrders: {
            user: {
              categoryId: item.categoryId,
            },
          },
          name: item.name,
          option: {
            path: '$.name',
            equals: existingOption.name,
          },
        },
        data: {
          price: tmpOption.price,
          inventoryUnitId: tmpOption.unitId,
          prevPrice: tmpOption?.prevPrice,
          isShowDiscount: tmpOption?.isShowDiscount,
          option: {
            name: tmpOption.name,
            price: tmpOption.price,
            ratio: tmpOption?.unit?.ratio || 1,
          },
        },
      });
    }

    await prisma.option.delete({
      where: {
        id: Number(id),
      },
    });

    return res.status(200).json({
      message: `Option ${existingOption.name} Deleted Successfully`,
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
