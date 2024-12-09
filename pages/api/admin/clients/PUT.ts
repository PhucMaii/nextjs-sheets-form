/* eslint-disable @typescript-eslint/no-unused-vars */
import { ORDER_TYPE, PAYMENT_TYPE } from '@/app/utils/enum';
import { IItem } from '@/app/utils/type';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';

interface BodyTypes {
  userId: number;
  clientId?: string;
  clientName?: string;
  deliveryAddress?: string;
  contactNumber?: string;
  orderType?: ORDER_TYPE;
  paymentType?: PAYMENT_TYPE;
  categoryId?: number;
  email?: string;
  password?: string;
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
      email,
      password,
    }: BodyTypes = req.body;

    console.log(email, 'email');

    const existingUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    const updateFields: any = {};

    updateFields.clientId = clientId;
    updateFields.clientName = clientName;
    updateFields.email = email;
    updateFields.deliveryAddress = deliveryAddress;
    updateFields.contactNumber = contactNumber;

    if (password) {
      updateFields.password = await bcrypt.hash(password, 12);
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
        include: {
          category: true,
          preference: true,
          scheduleOrders: true,
        },
      });

      // update schedule order if user update to their new cateogry
      if (
        updateFields.categoryId &&
        existingUser?.categoryId !== updateFields.categoryId
      ) {
        // Get all items in that category
        const newCategoryItems = await prisma.item.findMany({
          where: {
            categoryId: updateFields.categoryId,
          },
          include: {
            inventoryItem: true,
            inventoryUnit: true,
          },
        });

        if (updatedUser.scheduleOrders.length > 0) {
          for (const scheduleOrder of updatedUser.scheduleOrders) {
            // Replace all items to items in new category
            await prisma.orderedItems.deleteMany({
              where: {
                scheduledOrderId: scheduleOrder.id,
              },
            });

            const formatItemToOrderedItem = newCategoryItems.map(
              (item: any) => {
                return {
                  name: item.name,
                  quantity: 0,
                  price: item.price,
                  scheduledOrderId: scheduleOrder.id,
                  inventoryItemId: item.inventoryItemId,
                  inventoryUnitId: item.inventoryUnitId,
                };
              },
            );

            await prisma.orderedItems.createMany({
              data: formatItemToOrderedItem,
            });

            await prisma.scheduleOrders.update({
              where: {
                id: scheduleOrder.id,
              },
              data: {
                totalPrice: 0,
              },
            });
          }
        }
      }

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
    } else {
      const updatedPreference = await prisma.userPreference.update({
        where: {
          id: existingUser.userPreferenceId,
        },
        data: updatePrefFields,
      });
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
