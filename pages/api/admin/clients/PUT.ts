/* eslint-disable @typescript-eslint/no-unused-vars */
import { ORDER_TYPE, PAYMENT_TYPE } from '@/app/utils/enum';
import { PrismaClient } from '@prisma/client';
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

      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          userPreferenceId: newPref.id,
        },
      });
    } else {
      await prisma.userPreference.update({
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
