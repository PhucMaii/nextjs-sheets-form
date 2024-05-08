/* eslint-disable @typescript-eslint/no-unused-vars */
import { ORDER_STATUS, ORDER_TYPE, PAYMENT_TYPE } from '@/app/utils/enum';
import {
  Item,
  OrderedItems,
  PrismaClient,
  User,
  UserPreference,
} from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface BodyTypes {
  userId: number;
  clientId?: string;
  clientName?: string;
  deliveryAddress?: string;
  contactNumber?: string;
  orderType?: ORDER_TYPE;
  paymentType?: PAYMENT_TYPE;
  categoryId?: number;
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();
    const {
      userId,
      clientId,
      clientName,
      deliveryAddress,
      contactNumber,
      categoryId,
      orderType,
      paymentType,
    }: BodyTypes = req.body;

    const existingUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    const updateFields: any = {};

    if (clientId) {
      updateFields.clientId = clientId;
    }

    if (clientName) {
      updateFields.clientName = clientName;
    }

    if (deliveryAddress) {
      updateFields.deliveryAddress = deliveryAddress;
    }

    if (contactNumber) {
      updateFields.contactNumber = contactNumber;
    }

    if (categoryId) {
      updateFields.categoryId = categoryId;
    }

    // If user don't input any updated data
    if (Object.keys(updateFields).length === 0 && !orderType && !paymentType) {
      return res.status(404).json({
        error: 'No updated data provided',
      });
    }

    // Handle if there is any updated data
    if (Object.keys(updateFields).length > 0) {
      const updatedUser = await prisma.user.update({
        where: {
          id: userId,
        },
        data: updateFields,
      });

      if (!orderType && !paymentType) {
        return res.status(200).json({
          data: updatedUser,
          message: 'User Updated Successfully',
        });
      }
    }

    const updatePrefFields: any = {};

    if (orderType) {
      updatePrefFields.orderType = orderType;
    }

    if (paymentType) {
      updatePrefFields.paymentType = paymentType;
    }

    // Handle if user have not had the user preference
    if (!existingUser?.userPreferenceId) {
      const newPref = await prisma.userPreference.create({
        data: {
          userId,
          orderType: orderType || 'N/A',
          paymentType: paymentType || 'N/A',
        },
      });

      const newUser = await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          userPreferenceId: newPref.id,
        },
      });

      if (orderType === ORDER_TYPE.FIXED) {
        await initializeSheduleOrder(newUser);
      }
    } else {
      const updatedPreference = await prisma.userPreference.update({
        where: {
          id: existingUser.userPreferenceId,
        },
        data: updatePrefFields,
      });

      // if (!existingUser.scheduleOrdersId || orderType === ORDER_TYPE.FIXED) {
      //   await initializeSheduleOrder(existingUser);
      // }
    }

    const returnData = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        category: true,
        preference: true,
      },
    });

    return res.status(200).json({
      data: returnData,
      message: 'Update Client Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}

export const initializeSheduleOrder = async (user: User) => {
  try {
    const prisma = new PrismaClient();
    const userOrders = await prisma.orders.findMany({
      where: {
        userId: user.id,
        status: {
          in: [
            ORDER_STATUS.INCOMPLETED,
            ORDER_STATUS.COMPLETED,
            ORDER_STATUS.DELIVERED,
          ],
        },
      },
      include: {
        items: true,
      },
      orderBy: {
        id: 'desc',
      },
    });

    // If user do not have any previous order
    if (userOrders.length === 0) {
      const newScheduleOrder = await prisma.scheduleOrders.create({
        data: {
          totalPrice: 0,
          userId: user.id,
          day: ''
        },
      });

      const itemsSameCategory = await prisma.item.findMany({
        where: {
          categoryId: user.categoryId,
        },
      });

      const newItems = itemsSameCategory.map((item: Item) => {
        return {
          quantity: 0,
          scheduledOrderId: newScheduleOrder.id,
          price: item.price,
          name: item.name,
        };
      });

      const newScheduleOrderItems = await prisma.orderedItems.createMany({
        data: newItems,
      });

      // update user
      // await prisma.user.update({
      //   where: {
      //     id: user.id,
      //   },
      //   data: {
      //     scheduleOrdersId: newScheduleOrder.id,
      //   },
      // });

      return { ...newScheduleOrder, items: newScheduleOrderItems };
    }

    const userLastOrder = userOrders[0];

    const newScheduleOrder = await prisma.scheduleOrders.create({
      data: {
        totalPrice: userLastOrder.totalPrice,
        userId: user.id,
        day: ''
      },
    });

    // Copy items from last order and apply to new schedule order
    const newItems = userLastOrder.items.map((item: OrderedItems) => {
      const { id, orderId, ...restFields } = item;
      return { ...restFields, scheduledOrderId: newScheduleOrder.id };
    });

    const newScheduleOrderItems = await prisma.orderedItems.createMany({
      data: newItems,
    });

    // // update user
    // await prisma.user.update({
    //   where: {
    //     id: user.id,
    //   },
    //   data: {
    //     scheduleOrdersId: newScheduleOrder.id,
    //   },
    // });

    return { ...newScheduleOrder, items: newScheduleOrderItems };
  } catch (error: any) {
    console.log(
      'Internal Server Error, fail to initialize schedule order: ' + error,
    );
  }
};
