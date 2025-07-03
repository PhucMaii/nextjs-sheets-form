import { NextApiRequest, NextApiResponse } from "next";
import prisma from '@/client';

interface IBody {
    orderIds: number[];
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { companyId } = req.query;

        if (!companyId) {
            return res.status(400).json({ error: 'Company ID is required' });
        }

        const { orderIds } = req.body as IBody;

        if (!orderIds || orderIds.length === 0) {
            return res.status(400).json({ error: 'Order IDs are required' });
        }

        // Update orders with companyId
        await prisma.orders.updateMany({
            where: {
                id: {
                    in: orderIds}},
            data: {
                companyId: Number(companyId)}});

        await prisma.orderedItems.updateMany({
            where: {
                orderId: {
                    in: orderIds}},
            data: {
                companyId: Number(companyId)}});

        await prisma.fifo.updateMany({
            where: {
                companyId: null},
            data: {
                companyId: Number(companyId)}});

        return res.status(200).json({   
            message: 'Orders updated successfully'});
    } catch (error: any) {
        console.error('Internal Server Error: ', error);
        res.status(500).json({ error: error.message });
    }
}