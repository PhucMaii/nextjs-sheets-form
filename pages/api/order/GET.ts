import { Orders } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { ORDER_STATUS } from '@/app/utils/enum';
import { generateListOfDateString } from '@/app/utils/time';
import { getTodayDate, normalizeDate } from '../utils/date';
import { getOverdueOrders } from '../utils/order';
import prisma from '@/client';


interface IQuery {
  startDate?: string;
  endDate?: string;
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '8mb', // Set desired value here
    }}};

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { startDate, endDate }: IQuery = req.query;

    if (!startDate || !endDate) {
      return res.status(404).json({ error: 'Missing required parameters' });
    }

    const session: any = await getServerSession(req, res, authOptions);

    const existingUser = await prisma.user.findUnique({
      where: {
        id: Number(session?.user?.id)},
      include: {
        category: true}});

    if (!existingUser) {
      return res.status(401).json({ error: 'User Not Found' });
    }

    const formattedStartDate = normalizeDate(new Date(startDate));
    const formattedEndDate = normalizeDate(new Date(endDate));

    // formattedEndDate.setDate(formattedEndDate.getDate() - 1);

    const dateList = generateListOfDateString(
      formattedStartDate,
      formattedEndDate,
    );

    const userOrders: any = await prisma.orders.findMany({
      where: {
        userId: existingUser.id,
        status: {
          not: ORDER_STATUS.VOID},
        deliveryDate: {
          in: dateList}},
      include: {
        items: {
          include: {
            inventoryItem: true,
            inventoryUnit: true}},
        user: true,
        delivery: {
          include: {
            medias: true}}},
      orderBy: {
        id: 'desc'}});

    const newOrders = formatReturnOrders(userOrders);
    const totalAmount = userOrders.reduce((acc: number, order: Orders) => {
      return acc + order.totalPrice;
    }, 0);

    // Get debt data
    const { orders: incompletedOrders, overDue: dueAmount } =
      await getOverdueOrders(existingUser.id);

    const dueOrders = formatReturnOrders(incompletedOrders);

    // Get today delivered order
    const today = getTodayDate();
    const todayOrder = await prisma.orders.findFirst({
      where: {
        userId: existingUser.id,
        status: ORDER_STATUS.DELIVERED,
        deliveryDate: today.date},
      include: {
        items: {
          include: {
            inventoryItem: true,
            inventoryUnit: true}},
        user: true,
        delivery: {
          include: {
            medias: true}}}});

    if (todayOrder?.delivery && !todayOrder?.delivery?.isViewed) {
      await prisma.delivery.update({
        where: {
          id: todayOrder?.delivery?.id},
        data: {
          isViewed: true}});
    }

    let todayDeliveredOrder: any = [];
    if (todayOrder) {
      todayDeliveredOrder = formatReturnOrders([todayOrder]);
    }

    return res.status(200).json({
      data: {
        user: existingUser,
        currentMonthBill: totalAmount,
        dueAmount,
        dueOrders,
        userOrders: newOrders,
        todayDeliveredOrder: todayDeliveredOrder[0] || null},
      message: 'Fetch User Orders Successfully'});
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error});
  }
}

const formatReturnOrders = (orders: any) => {
  if (!orders || orders.length === 0) {
    return [];
  }

  const newOrders = orders.map((order: any) => {
    if (order.items.length === 0) {
      return {
        ...order,
        items: []};
    }

    const items = order.items.map((item: any) => {
      const totalPrice = item.quantity * item.price;
      return { ...item, totalPrice };
    });

    return {
      ...order,
      items,
      ...order.user,
      id: order.id};
  });

  return newOrders;
};
