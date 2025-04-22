import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { updateScheduledOrdersTotalPrice } from './POST';

interface IQuery {
  id?: string;
  newOptionId?: string;
}

export default async function DELETE(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const prisma = new PrismaClient();

    const { id, newOptionId }: IQuery = req.query;

    if (!id) {
      return res.status(404).json({
        error: 'Option Id Not Provided',
      });
    }

    const existingOption = await prisma.option.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        item: true,
        unit: true,
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
      const toBeUpdatedItems = await prisma.orderedItems.findMany({
        where: {
          ScheduleOrders: {
            user: {
              categoryId: item.categoryId,
            },
          },
          name: item.name,
        },
        include: {
          ScheduleOrders: {
            include: {
              items: true,
            },
          },
        },
      });

      // Remove options in scheduledOrderedItems related
      if (toBeUpdatedItems.length > 0) {
        await prisma.orderedItems.updateMany({
          where: {
            id: {
              in: toBeUpdatedItems.map((item) => item.id),
            },
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
      }

      const responseStatus = await updateScheduledOrdersTotalPrice(
        toBeUpdatedItems,
        item.price,
      );

      if (!responseStatus.ok) {
        return res.status(400).json({
          error: 'Failed to update scheduled orders total price',
        });
      }
    } else {
      // Move item option to another option
      // const otherOptions = item.options.filter(
      //   (option) => option.id !== existingOption.id,
      // );

      // const tmpOption = otherOptions[0];
      const tmpOption = await prisma.option.findUnique({
        where: {
          id: Number(newOptionId),
        },
        include: {
          unit: true,
          item: true,
        },
      });

      if (!tmpOption) {
        return res.status(400).json({
          error: 'Conflict new option not found',
        });
      }

      const toBeUpdatedItems = await prisma.orderedItems.findMany({
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
        include: {
          ScheduleOrders: {
            include: {
              items: true,
            },
          },
        },
      });

      if (toBeUpdatedItems.length > 0) {
        await prisma.orderedItems.updateMany({
          where: {
            id: {
              in: toBeUpdatedItems.map((item) => item.id),
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

      // const updatedItems = await prisma.orderedItems.findMany({
      //   where: {
      //     ScheduleOrders: {
      //       user: {
      //         categoryId: item.categoryId,
      //       },
      //     },
      //     name: item.name,
      //     option: {
      //       path: '$.name',
      //       equals: existingOption.name,
      //     },
      //   },
      //   include: {
      //     ScheduleOrders: true,
      //   },
      // });

      const responseStatus = await updateScheduledOrdersTotalPrice(
        toBeUpdatedItems,
        tmpOption.price,
      );

      if (!responseStatus.ok) {
        return res.status(400).json({
          error: 'Failed to update scheduled orders total price',
        });
      }
    }

    await prisma.option.delete({
      where: {
        id: Number(id),
      },
    });

    const updatedItem = await prisma.item.findUnique({
      where: {
        id: existingOption.itemId,
      },
      include: {
        options: {
          include: {
            unit: true,
            item: true,
          },
        },
        inventoryUnit: true,
        inventoryItem: {
          include: {
            vendorItem: {
              include: {
                unit: true,
              },
            },
            type: true,
          },
        },
        category: {
          include: {
            itemType_category: {
              include: {
                itemType: true,
              },
            },
          },
        },
      },
    });

    return res.status(200).json({
      data: updatedItem,
      message: `Option ${existingOption.name} Deleted Successfully`,
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
