/* eslint-disable @typescript-eslint/no-unused-vars */
import { ORDER_TYPE, PAYMENT_TYPE, USER_CATEGORIZED } from '@/app/utils/enum';
import { IItem } from '@/app/utils/type';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { generateLatLng } from './POST';
import { categorizeUpdatedItems, ITEM_CATEGORIZED } from '../orderedItems/PUT';

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
  type?: USER_CATEGORIZED;
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
      type,
    }: BodyTypes = req.body;

    const existingUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    const updateFields: any = {};

    if (clientId !== existingUser?.clientId) {
      updateFields.clientId = clientId;
    }

    if (clientName !== existingUser?.clientName) {
      updateFields.clientName = clientName;
    }

    if (email !== existingUser?.email) {
      updateFields.email = email;
    }

    if (deliveryAddress && deliveryAddress !== existingUser?.deliveryAddress) {
      updateFields.deliveryAddress = deliveryAddress;
      const addresss = await generateLatLng(deliveryAddress);
      updateFields.deliveryAddressLat = addresss.latitude;
      updateFields.deliveryAddressLng = addresss.longitude;
    }

    if (contactNumber !== existingUser?.contactNumber) {
      updateFields.contactNumber = contactNumber;
    }

    if (password) {
      updateFields.password = await bcrypt.hash(password, 12);
    }

    if (categoryId) {
      updateFields.categoryId = categoryId;
    }

    console.log(type, 'type');
    if (type && type !== existingUser?.type) {
      updateFields.type = type;
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
            const orderdItems = await prisma.orderedItems.findMany({
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
                  prevPrice: item?.prevPrice,
                  isShowDiscount: item?.isShowDiscount,
                };
              },
            );

            // Compare by name
            const categorizedItems = categorizeUpdatedItems(
              formatItemToOrderedItem,
              orderdItems,
              'name',
            );

            const newItems = categorizedItems.filter((item: any) => {
              return (
                item.type !== ITEM_CATEGORIZED.DELETE &&
                item.type !== ITEM_CATEGORIZED.CREATE
              );
            });

            await prisma.orderedItems.deleteMany({
              where: {
                scheduledOrderId: scheduleOrder.id,
              },
            });

            await prisma.orderedItems.createMany({
              data: newItems.map((item: any) => {
                return {
                  name: item.name,
                  quantity: item.quantity,
                  price: item.price,
                  scheduledOrderId: scheduleOrder.id,
                  inventoryItemId: item.inventoryItemId,
                  inventoryUnitId: item.inventoryUnitId,
                  prevPrice: item?.prevPrice,
                  isShowDiscount: item?.isShowDiscount,
                };
              }),
            });

            // generate total price
            const totalPrice = newItems.reduce((acc: any, item: any) => {
              return acc + item.price * item.quantity;
            }, 0);

            await prisma.scheduleOrders.update({
              where: {
                id: scheduleOrder.id,
              },
              data: {
                totalPrice,
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
