// import { google } from 'googleapis';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';
import { FLAG_ORDER_TYPE, USER_ROLE } from '@/app/utils/enum';
// import { sheetStructure } from '@/config/sheetStructure';
import { normalizeDate } from '../utils/date';
import withAuthGuard from '../utils/withAuthGuard';
import {
  checkHasClientOrder,
  // createOrder,
  getCreatedBy,
  overrideOrder,
} from './utils';
import { createOrder } from '../admin/orders/POST';
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
  createdAt: string;
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
      createdAt,
    }: IBody = req.body;

    // console.log({
    //   body: req.body,
    // });
    // console.log({
    //   items
    // })

    if (!deliveryDate || !items || !createdAt) {
      return res
        .status(400)
        .json({
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

    const formattedCreatedBy = await getCreatedBy(req, res, createdBy);

    // Check is delivery date in client's vacation range
    if (isCheckUnavailableRange) {
      const normalizedDeliveryDate = normalizeDate(new Date(deliveryDate));
      for (const dayRange of existingUser.unavailableDayRange) {
        const normalizedStartDate = normalizeDate(dayRange.startDate);
        const normalizedEndDate = normalizeDate(dayRange.endDate);

        normalizedEndDate.setDate(normalizedEndDate.getDate() - 1);
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
      if (createdBy === USER_ROLE.ADMIN && isForceOrder) {
        const newOrder: any = await createOrder(
          existingUser,
          items,
          deliveryDate,
          createdAt,
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
        const itemListWithTotalPrice = formatItemsWithTotalPrice(newOrder.items);

        await pusherServer?.trigger('admin', 'incoming-order', {
          ...newOrder,
          items: itemListWithTotalPrice,
          ...existingUser,
          id: newOrder.id,
          category: existingUser.category,
        });
      }

      if (createdBy !== USER_ROLE.CLIENT) {
        return res.status(200).json({
          warning: `Client ${existingUser.clientName} has ordered for ${deliveryDate}`,
          data: userOrder,
          flag: FLAG_ORDER_TYPE.ALREADY_ORDER,
        });
      }

      // TODO: OVERRIDE ORDER

      // const newItems = Object.keys(body).filter((item: string) => {
      //   return item !== 'DELIVERY DATE' && item !== 'NOTE';
      // });

      // const items = userOrder.items.map((item: any) => {
      //   const targetNewItem = newItems.find(
      //     (newItemName: any) => item.name === newItemName,
      //   );

      //   if (targetNewItem) {
      //     return { ...item, quantity: body[targetNewItem] };
      //   }

      //   return item;
      // });

      await overrideOrder(
        existingUser,
        userOrder.id,
        items,
        note,
        formattedCreatedBy,
      );
      return res.status(201).json({
        message: 'Order Submitted Successfully',
      });
    }

    // await createOrder(existingUser, items, deliveryDate,
    //   formattedCreatedBy, note
    // )
    const newOrder: any = await createOrder(
      existingUser,
      items,
      deliveryDate,
      createdAt,
      formattedCreatedBy,
      note,
    );

    // const itemListWithTotalPrice = newOrder?.items.map((item: OrderedItems) => {
    //   const itemTotalPrice = item.price * item.quantity;

    //   return { ...item, totalPrice: itemTotalPrice };
    // });
    const itemListWithTotalPrice = formatItemsWithTotalPrice(newOrder?.items || []);

    const itemHasQuantity = itemListWithTotalPrice.filter((item: any) => {
      return item.quantity > 0;
    })

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
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
};

export default withAuthGuard(handler);
