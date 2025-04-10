import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getTodayDate } from '../../utils/date';
import { getUserInfo } from '../../utils/auth';

const prisma = new PrismaClient();

interface IBody {
  name: string;
  price: number;
  unitId: number;
  itemId: number;
  selectedCategoryIds: number[];
  inventoryItemId: number; // for finding items in selected category
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      name,
      price,
      unitId,
      itemId,
      selectedCategoryIds,
      inventoryItemId,
    }: IBody = req.body;

    if (Number(unitId) < 1) {
      return res.status(500).json({ error: 'Please select a unit' });
    }

    if (!name || price === 0) {
      return res.status(500).json({ error: 'Please fill out all the blank' });
    }

    if (selectedCategoryIds.length === 0) {
      return res
        .status(500)
        .json({ error: 'Please select at least one category' });
    }

    // Check is unitId existed in itemId
    // const sameUnitOption = await prisma.option.findFirst({
    //   where: {
    //     unitId,
    //     itemId,
    //   },
    // });

    // if (sameUnitOption) {
    //   return res.status(500).json({
    //     error: 'Option Name Existed',
    //   });
    // }

    const today = getTodayDate();
    const admin = await getUserInfo(req, res);
    const newOption = await prisma.option.create({
      data: {
        name,
        price,
        availability: true,
        unitId: Number(unitId),
        itemId,
        inventoryItemId,
        createdAt: today.dateAndTime,
        createdBy: `Admin - ${admin?.clientName}`,
      },
    });

    const allItemsInvolved = await prisma.item.findMany({
      where: {
        id: {
          not: itemId,
        },
        inventoryItemId,
        categoryId: {
          in: selectedCategoryIds,
        },
      },
    });

    // const allItemsInvolvedIds = allItemsInvolved.map((item: any) => item.id);

    // // Find all options related to the items
    // const allOptionsInvolved = await prisma.option.findMany({
    //   where: {
    //     itemId: {
    //       in: allItemsInvolvedIds,
    //     },
    //   },
    // });

    // // Delete the old ones
    // await prisma.option.deleteMany({
    //   where: {
    //     id: {
    //       in: allOptionsInvolved.map((option: any) => option.id),
    //     },
    //   },
    // });

    // Create new options
    const newOptions = allItemsInvolved.map((item: any) => {
      return {
        name,
        price,
        availability: true,
        unitId: Number(unitId),
        itemId: item.id,
        inventoryItemId,
        createdAt: today.dateAndTime,
        createdBy: `Admin - ${admin?.clientName}`,
      };
    });

    console.log({ newOptions });

    await prisma.option.createMany({
      data: newOptions,
    });

    const retrievedNewOptions = await prisma.option.findMany({
      where: {
        createdAt: today.dateAndTime,
        createdBy: `Admin - ${admin?.clientName}`,
      },
      include: {
        item: true,
        unit: true,
      },
    });

    // Handle update scheduled orders
    const responseStatus = await updateScheduledOrderedItemsOptions(
      retrievedNewOptions,
      selectedCategoryIds,
    );

    if (!responseStatus.ok) {
      return res.status(500).json({
        error:
          'Fail to update scheduled orders item options + ' +
          responseStatus.error,
      });
    }

    return res.status(201).json({
      data: newOption,
      message: 'Create New Option Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}

const updateScheduledOrderedItemsOptions = async (
  newOptions: any,
  updatedCategoryIds: number[],
) => {
  try {
    const prisma = new PrismaClient();
    const retrievedNewOptions = newOptions;

    // // Save the order id of orders that need to be updated in total price
    // const orderIdToChangeTotal: number[] = [];

    // Handle update scheduled orders
    for (const option of retrievedNewOptions) {
      const targetedScheduleOrderedItems = await prisma.orderedItems.findMany({
        where: {
          ScheduleOrders: {
            user: {
              categoryId: {
                in: updatedCategoryIds,
              },
            },
          },
          name: option.item.name,
        },
        include: {
          ScheduleOrders: true,
        },
      });

      console.log(
        'targetedScheduleOrderedItems: ',
        targetedScheduleOrderedItems,
      );

      // Filter the items does not have option
      const itemsDoesNotHaveOptions = targetedScheduleOrderedItems.filter(
        (item: any) => {
          return !item?.option?.name && item?.option?.price === 0;
        },
      );

      console.log(itemsDoesNotHaveOptions, '  itemsDoesNotHaveOptions');

      if (itemsDoesNotHaveOptions.length > 0) {
        // Find the option has the ratio of 1
        const optionWithRatioOne = await prisma.option.findFirst({
          where: {
            itemId: option.item.id,
            unit: {
              ratio: 1,
            },
          },
          include: {
            unit: true,
          },
        });

        const toBeAssignedOption = optionWithRatioOne
          ? optionWithRatioOne
          : option;

        console.log(toBeAssignedOption, 'toBeAssignedOption');

        // Assign option ratio of 1 to the items have no option existed
        await prisma.orderedItems.updateMany({
          where: {
            id: {
              in: itemsDoesNotHaveOptions.map((item: any) => item.id),
            },
          },
          data: {
            price: toBeAssignedOption.price,
            prevPrice: toBeAssignedOption?.prevPrice,
            isShowDiscount: toBeAssignedOption?.isShowDiscount,
            inventoryUnitId: Number(toBeAssignedOption?.unitId),
            option: {
              name: toBeAssignedOption.name,
              price: toBeAssignedOption.price,
              ratio: toBeAssignedOption?.unit?.ratio || 1,
              prevPrice: toBeAssignedOption?.prevPrice,
              isShowDiscount: toBeAssignedOption?.isShowDiscount,
            },
          },
        });

        // Update scheduledOrder total price
        const responseStatus = await updateScheduledOrdersTotalPrice(
          itemsDoesNotHaveOptions,
          toBeAssignedOption.price,
        );

        if (!responseStatus.ok) {
          return { ok: false, error: responseStatus.error };
        }
      }
    }

    return { ok: true };
  } catch (error: any) {
    console.log('Fail to update scheduled orders item options: ', error);
    return { ok: false, error };
  }
};

export const updateScheduledOrdersTotalPrice = async (
  scheduledOrderedItems: any[], // can be in different orders
  newItemPrice: number,
) => {
  try {
    console.log('UPDATE TOTAL PRICE');
    const updatedOrders = scheduledOrderedItems.map((item: any) => {
      console.log({ oldPrice: item.price, newItemPrice });
      const newTotalPrice =
        item.ScheduleOrders?.totalPrice -
        item.price * item.quantity +
        newItemPrice * item.quantity;

      console.log(newTotalPrice, 'newTotalPrice');
      return prisma.scheduleOrders.update({
        where: {
          id: item.scheduledOrderId,
        },
        data: {
          totalPrice: newTotalPrice,
        },
      });
    });

    console.log(updatedOrders, 'updatedOrders');

    await Promise.all(updatedOrders);

    // for (const item of scheduledOrderedItems) {
    //   if (item.scheduledOrderId && item.ScheduleOrders) {
    //     const newTotalPrice =
    //       item.ScheduleOrders?.totalPrice -
    //       item.price * item.quantity +
    //       newItemPrice * item.quantity;
    //     await prisma.scheduleOrders.update({
    //       where: {
    //         id: item.scheduledOrderId,
    //       },
    //       data: {
    //         totalPrice: newTotalPrice,
    //       },
    //     });
    //   }
    // }

    return { ok: true };
  } catch (error: any) {
    return { ok: false, error };
  }
};
