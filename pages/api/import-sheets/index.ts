import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';
import { FLAG_ORDER_TYPE, USER_CATEGORIZED, USER_ROLE } from '@/app/utils/enum';
import {
  checkOrderDeliveryDateValid,
  convertToPSTDate,
  normalizeDate,
} from '../utils/date';
import withAuthGuard from '../utils/withAuthGuard';
import { checkHasClientOrder, getCreatedBy } from './utils';
import { createOrder } from '@/pages/api/admin/[companyId]/orders/POST';
import { pusherServer } from '@/app/pusher';
import { sendEmail } from '../utils/email';
import { formatItemsWithTotalPrice } from '../utils/order';

interface RequestQuery {
  userId?: string;
}

interface IBody {
  deliveryDate: string;
  note: string;
  orderTime: string;
  isCheckUnavailableRange?: boolean;
  items: any[];
  createdBy: USER_ROLE;
  isForceOrder?: boolean;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(500).send('Only Post method allowed');
  }

  try {
    const prisma = new PrismaClient();
    const { userId } = req.query as RequestQuery;
    const {
      deliveryDate,
      note,
      isCheckUnavailableRange,
      items,
      createdBy,
      isForceOrder,
    }: IBody = req.body;

    console.log('body', req.body);

    if (!deliveryDate || !items) {
      return res.status(400).json({
        error: 'Missing required fields. Please refresh and try again',
      });
    }

    let id = userId;

    // Check is user authenticated
    if (!userId) {
      const session: any = await getServerSession(req, res, authOptions);
      if (!session) {
        return res.status(401).json({ error: 'You are not authenticated' });
      }
      id = session.user.id;
    }

    if (createdBy === USER_ROLE.CLIENT) {
      const isValidDate = checkOrderDeliveryDateValid(deliveryDate);
      if (!isValidDate.ok) {
        return res.status(400).json({
          error: isValidDate.message,
        });
      }
    }

    // Check does user exist
    const existingUser = await prisma.user.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        unavailableDayRange: true,
        category: true,
      },
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'User Not Found in DB' });
    }

    // Check if user account is inactive
    if (existingUser?.type === USER_CATEGORIZED.INACTIVE) {
      return res.status(400).json({
        error: 'Client Account Is INACTIVE',
      });
    }

    // Check if any item quantity is decimal number
    for (const item of items) {
      if (item.quantity % 1 !== 0) {
        return res.status(400).json({
          error: 'Quantity must be whole number',
        });
      }
    }

    const formattedCreatedBy = await getCreatedBy(req, res, createdBy);

    // Check is delivery date in client's vacation range
    if (isCheckUnavailableRange) {
      // const normalizedDeliveryDate = convertToPSTDate(deliveryDate);
      const normalizedDeliveryDate = normalizeDate(new Date(deliveryDate));
      for (const dayRange of existingUser.unavailableDayRange) {
        // const normalizedStartDate = normalizeDate(dayRange.startDate);
        // const normalizedEndDate = normalizeDate(dayRange.endDate);

        const normalizedStartDate = convertToPSTDate(dayRange.startDate);
        const normalizedEndDate = convertToPSTDate(dayRange.endDate);

        // normalizedEndDate.setDate(normalizedEndDate.getDate() - 1);
        if (
          normalizedDeliveryDate >= normalizedStartDate &&
          normalizedDeliveryDate <= normalizedEndDate
        ) {
          return res.status(200).json({
            warning: `Client ${
              existingUser.clientName
            } has request time off from ${dayRange.startDate.toDateString()} to ${dayRange.endDate.toDateString()}`,
            data: {
              unavailableRange: [dayRange.startDate, dayRange.endDate],
              client: existingUser,
            },
            flag: FLAG_ORDER_TYPE.VACATION_ORDER,
          });
        }
      }
    }

    // Check has user already ordered for target delivery date yet
    const userOrder = await checkHasClientOrder(existingUser.id, deliveryDate);

    // Handle is user has already ordered for target date
    if (userOrder) {
      if (
        (createdBy === USER_ROLE.ADMIN ||
          createdBy === USER_ROLE.SUPER_ADMIN) &&
        isForceOrder
      ) {
        const itemsWithNo0 = items.filter((item: any) => item.quantity > 0);
        const newOrder: any = await createOrder(
          existingUser?.companyId || -1,
          existingUser,
          itemsWithNo0,
          deliveryDate,
          formattedCreatedBy,
          note,
        );

        // const itemListWithTotalPrice = newOrder?.items.map(
        //   (item: OrderedItems) => {
        //     let totalPrevPrice = 0;

        //     if (item?.isShowDiscount && item?.prevPrice) {
        //       totalPrevPrice = item.prevPrice * item.quantity;
        //     }
        //     const itemTotalPrice = item.price * item.quantity;

        //     return { ...item, totalPrice: itemTotalPrice, totalPrevPrice };
        //   },
        // );
        const itemListWithTotalPrice = formatItemsWithTotalPrice(
          newOrder.items,
        );

        await pusherServer?.trigger('admin', 'incoming-order', {
          ...newOrder,
          items: itemListWithTotalPrice,
          ...existingUser,
          id: newOrder.id,
          category: existingUser.category,
        });
      }

      const lastOrderItems = userOrder.items.map((item: any) => {
        const isInNewItems = items.find(
          (newItem: any) => newItem.name === item.name,
        );

        if (isInNewItems) {
          return { ...item, quantity: isInNewItems.quantity };
        }

        return item;
      });

      const newItems = items.filter((item: any) => {
        const isInLastOrder = lastOrderItems.find(
          (lastItem: any) => lastItem.name === item.name,
        );

        return !isInLastOrder;
      });

      const lastOrderItemsWithNewValue = lastOrderItems.map((item: any) => {
        const isInInputItems = items.find(
          (newItem: any) => newItem.name === item.name,
        );

        if (isInInputItems) {
          return isInInputItems;
        }

        return item;
      });

      const lastOrderFinalItems = [...lastOrderItemsWithNewValue, ...newItems];

      const lastOrderTotalPrice = lastOrderFinalItems.reduce(
        (total: number, item: any) => {
          return total + item.quantity * item.price;
        },
        0,
      );

      const currentOrderTotalPrice = items.reduce(
        (total: number, item: any) => {
          return total + item.quantity * item.price;
        },
        0,
      );
      // else if (createdBy !== USER_ROLE.CLIENT) {
      return res.status(200).json({
        warning: `Client ${existingUser.clientName} has ordered for ${deliveryDate}`,
        lastOrder: {
          ...userOrder,
          items: lastOrderFinalItems,
          totalPrice: lastOrderTotalPrice,
          note,
        },
        currentOrder: {
          ...userOrder,
          totalPrice: currentOrderTotalPrice,
          items,
          note,
          // createdBy: userOrder.createdBy,
        },
        flag: FLAG_ORDER_TYPE.ALREADY_ORDER,
      });
      // }

      // const itemsWithNo0 = items.filter((item: any) => item.quantity > 0);
      // await overrideOrder(
      //   existingUser,
      //   userOrder.id,
      //   itemsWithNo0,
      //   note,
      //   formattedCreatedBy,
      // );
      // return res.status(201).json({
      //   message: 'Order Submitted Successfully',
      // });
    }

    // await createOrder(existingUser, items, deliveryDate,
    //   formattedCreatedBy, note
    // )
    const itemsWithNo0 = items.filter((item: any) => item.quantity > 0);
    const newOrder: any = await createOrder(
      existingUser?.companyId || -1,
      existingUser,
      itemsWithNo0,
      deliveryDate,
      formattedCreatedBy,
      note,
    );

    // const itemListWithTotalPrice = newOrder?.items.map((item: OrderedItems) => {
    //   const itemTotalPrice = item.price * item.quantity;

    //   return { ...item, totalPrice: itemTotalPrice };
    // });
    const itemListWithTotalPrice = formatItemsWithTotalPrice(
      newOrder?.items || [],
    );

    const itemHasQuantity = itemListWithTotalPrice.filter((item: any) => {
      return item.quantity > 0;
    });

    await pusherServer?.trigger('admin', 'incoming-order', {
      ...newOrder,
      items: itemHasQuantity,
      ...existingUser,
      id: newOrder.id,
      category: existingUser.category,
    });

    const isSendToAdmin = true;
    await sendEmail(
      existingUser,
      newOrder,
      newOrder.id,
      newOrder.deliveryDate,
      isSendToAdmin,
      note,
    );
    return res.status(200).json({
      // overviewFormattedData,
      message: 'Order Submitted Successfully',
    });
  } catch (error: any) {
    console.log(error);
    // If it's a Pusher "Payload Too Large" error (413)
    if (error?.status === 413 || error?.message?.includes('413')) {
      return res.status(200).json({
        message:
          'Payload too large – event not sent, but continuing gracefully.',
      });
    }
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
};

export default withAuthGuard(handler);
