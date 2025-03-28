import { OrderedItems } from '@/app/utils/type';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { updateScheduledOrdersTotalPrice } from './POST';

interface IBody {
  id: number;
  name: string;
  price: number;
  unitId: number;
  prevPrice: number;
  isShowDiscount: boolean;
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { id, name, price, prevPrice, isShowDiscount, unitId }: IBody =
      req.body;

    const existingOption = await prisma.option.findUnique({
      where: {
        id,
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

    const updateFields: any = {};

    if (existingOption.name !== name) {
      updateFields.name = name;
    }

    if (existingOption.price !== price) {
      updateFields.price = price;
    }

    if (existingOption.unitId !== unitId) {
      updateFields.unitId = unitId;
    }

    if (existingOption.prevPrice !== prevPrice) {
      updateFields.prevPrice = prevPrice;
    }

    if (existingOption.isShowDiscount !== isShowDiscount) {
      updateFields.isShowDiscount = isShowDiscount;
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(200).json({
        message: 'Option Updated Successfully',
        // data: updatedOption,
      });
    }

    const updatedOption = await prisma.option.update({
      where: {
        id,
      },
      data: {
        ...updateFields,
      },
    });

    await updateAllScheduleOrderItemsForOption(
      existingOption,
      updatedOption,
      existingOption.item.categoryId,
    );

    return res.status(200).json({
      message: 'Option Updated Successfully',
      // data: updatedOption,
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}

const updateAllScheduleOrderItemsForOption = async (
  oldOption: any,
  updatedOption: any,
  categoryId: number,
) => {
  try {
    const prisma = new PrismaClient();

    const scheduledOrders = await prisma.scheduleOrders.findMany({
      where: {
        user: {
          categoryId,
        },
      },
      include: {
        items: {
          include: {
            inventoryUnit: true,
            inventoryItem: true,
            ScheduleOrders: true,
          },
        },
      },
    });

    // Flat items in schedule orders
    const scheduleOrderItems = scheduledOrders.flatMap((scheduledOrder) => {
      return scheduledOrder.items.map((item) => item);
    });

    const itemsHaveUpdatedOption = scheduleOrderItems.filter(
      (item: OrderedItems | any) => {
        return (
          item?.option?.name === oldOption.name &&
          item.name === oldOption.item.name
        );
      },
    );

    if (itemsHaveUpdatedOption.length > 0) {
      await prisma.orderedItems.updateMany({
        where: {
          id: {
            in: itemsHaveUpdatedOption.map((item: OrderedItems | any) => {
              return item.id;
            }),
          },
        },
        data: {
          price: updatedOption.price,
          prevPrice: updatedOption?.prevPrice || 0,
          isShowDiscount: updatedOption?.isShowDiscount || false,
          inventoryUnitId: updatedOption?.unitId,
          option: {
            name: updatedOption.name,
            price: updatedOption.price,
            ratio: updatedOption?.unit?.ratio || 1,
            prevPrice: updatedOption?.prevPrice || 0,
            isShowDiscount: updatedOption?.isShowDiscount || false,
          },
        },
      });

      // Update scheduleOrders total price
      const responseStatus = await updateScheduledOrdersTotalPrice(
        itemsHaveUpdatedOption,
        updatedOption.price,
      );

      if (!responseStatus.ok) {
        return { ok: false, error: responseStatus.error };
      }
    }

    // Find the items still does not have option
    const itemsHaveNoOption = scheduleOrderItems.filter(
      (item: OrderedItems | any) => {
        return !item?.option?.name;
      },
    );

    // If there are items that does not have option, assign them to option has same ratio as they have
    if (itemsHaveNoOption.length > 0) {
      const allOptionsRelatedToItem = await prisma.option.findMany({
        where: {
          itemId: updatedOption.itemId,
        },
        include: {
          unit: true,
        },
      });

      // Loop through each item and update them
      for (const item of itemsHaveNoOption) {
        // Find the option that has same ratio as the item hold
        const optionWithSameRatio = allOptionsRelatedToItem.find(
          (option: any) => {
            return option.unit.ratio === item?.inventoryUnit?.ratio;
          },
        );

        // Get the option has the ratio of 1 just in case
        let option = optionWithSameRatio;
        if (!optionWithSameRatio) {
          option = allOptionsRelatedToItem.find((option: any) => {
            return option.unit.ratio === 1;
          });
        }

        const newItem = await prisma.orderedItems.update({
          where: {
            id: item.id,
          },
          data: {
            price: option?.price || updatedOption.price,
            prevPrice: option?.prevPrice || updatedOption?.prevPrice || 0,
            isShowDiscount:
              option?.isShowDiscount || updatedOption?.isShowDiscount || false,
            inventoryUnitId: option?.unitId || updatedOption?.unitId,
            option: {
              name: option?.name || updatedOption.name,
              price: option?.price || updatedOption.price,
              ratio: option?.unit?.ratio || updatedOption?.unit?.ratio || 1,
              prevPrice: option?.prevPrice || updatedOption?.prevPrice || 0,
              isShowDiscount: option?.isShowDiscount || false,
            },
          },
        });

        // Update scheduled order total price
        if (item.scheduledOrderId && item.ScheduleOrders) {
          const newTotalPrice =
            item.ScheduleOrders?.totalPrice -
            item.price * item.quantity +
            newItem.price * item.quantity;
          await prisma.scheduleOrders.update({
            where: {
              id: item.scheduledOrderId,
            },
            data: {
              totalPrice: newTotalPrice,
            },
          });
        }
      }
    }

    return { ok: true };
  } catch (error: any) {
    return { ok: false, error };
  }
};
