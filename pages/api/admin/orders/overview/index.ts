import { ORDER_STATUS } from "@/app/utils/enum";
import { filterDateRangeOrders } from "@/pages/api/utils/date";
import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

interface IQuery {
    startDate?: string,
    endDate?: string,
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== 'GET') {
            return res.status(404).json({
                error: 'Your method is not supported'
            })
        }
        const prisma = new PrismaClient();

        const { startDate, endDate }: IQuery = req.query;

        if (!startDate || !endDate) {
            return res.status(404).json({
                error: 'Date Range Is Not Provided'
            })
        }

        const formattedStartDate = new Date(startDate);
        const formattedEndDate = new Date(endDate);

        if (formattedStartDate > formattedEndDate) {
            return res.status(404).json({
                error: 'Date Range Is Not Provide Properly'
            })
        }

        const orders = await prisma.orders.findMany({
            where: {
                status: {
                    in: [ORDER_STATUS.COMPLETED, ORDER_STATUS.DELIVERED, ORDER_STATUS.INCOMPLETED]
                }
            }
        });

        if (!orders || orders.length === 0) {
            return res.status(404).json({
                error: 'Internal Server Error: Could Not Fetch Order'
            })
        };
        
        const filteredOrders = filterDateRangeOrders(orders, formattedStartDate, formattedEndDate);
        const revenue = filteredOrders.reduce((acc: number, order: any) => {
            return acc + order.totalPrice
        }, 0);
        
        const ongoingOrders = filteredOrders.filter((order: any) => {
            return order.status !== ORDER_STATUS.COMPLETED
        });
        const unpaidAmount = ongoingOrders.reduce((acc: number, order: any) => {
            return acc + order.totalPrice
        }, 0)
        
        const thisMonthRevenueReport: any = revenueGroupByDeliveryDate(filteredOrders);
        const lastMonthRevenueReport = getLastMonthRevenue(orders, formattedStartDate, thisMonthRevenueReport.values);

        const overviewData = {
            numberOfOrders: filteredOrders.length,
            revenue,
            ongoingOrders: ongoingOrders.length,
            unpaidAmount
        }

        
        return res.status(200).json({
          data: {
            overviewData,
            reports: {
              thisMonth: thisMonthRevenueReport.values,
              lastMonth: lastMonthRevenueReport,
              timeSeries: thisMonthRevenueReport.keys // Time series for displaying time for the chart
            },
          },
          message: 'Fetch Overview Data Successfully',
        });
    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({
            error: 'Internal Server Error: ' + error
        })
    }
}

const getLastMonthRevenue = (orders: any, startDate: Date, thisMonthRevenue: any[]) => {
    const lastMonth = startDate.getMonth();

    const lastMonthStart = new Date(startDate.getFullYear(), lastMonth - 1, 1);
    const lastMonthEnd = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    lastMonthEnd.setDate(0);

    const filteredOrders = filterDateRangeOrders(orders, lastMonthStart, lastMonthEnd);
    const revenueByDate = revenueGroupByDeliveryDate(filteredOrders);
    const formatLengthRevenue = revenueByDate.values.slice(0, thisMonthRevenue.length);
    return formatLengthRevenue;
}

const revenueGroupByDeliveryDate = (orders: any) => {
    const revenueByDate = orders.reduce((acc: any, order: any) => {
        const key = order.deliveryDate;

        if (acc[key]) {
            const newTotalPrice = Math.round((acc[key] + order.totalPrice) * 100) / 100;
            acc[key] = newTotalPrice;
        } else {
            acc[key] = Math.round(order.totalPrice * 100) / 100;
        }

        return acc;
    }, {});

    return {values: Object.values(revenueByDate), keys: Object.keys(revenueByDate)};
}