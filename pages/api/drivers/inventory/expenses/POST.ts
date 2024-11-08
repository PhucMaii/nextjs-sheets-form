/* eslint-disable @typescript-eslint/no-unused-vars */
import { mainPaymentMethodId } from "@/app/lib/constant";
import { getDriverInfo } from "@/pages/api/utils/auth";
import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

interface IBody {
    date: string;
    amount: number;
    description: string;
    paymentMethodId: number;
    createdAt: string;
    invoice: string;
    items: {
        id: number;
        quantity: number;
        unitPrice: number;
        vendorId: number;
        unit: string;
    }[]
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
    try { 
        const prisma = new PrismaClient();

        const { date, amount, description, paymentMethodId, createdAt, invoice, items }: IBody = req.body;

        const driver = await getDriverInfo(req, res);

        if (!driver) {
          return res.status(401).json({
            error: 'Unauthorized',
          });
        }

        const existingMethod = await prisma.paymentMethod.findUnique({
            where: {
              id: paymentMethodId,
            },
          });
      
          if (!existingMethod) {
            return res.status(404).json({
              error: 'Payment Method Not Found',
            });
          }
      
          if (paymentMethodId !== mainPaymentMethodId) {
            return res.status(400).json({
              error: 'Payment Method Not Allowed',
            });
        }

        const dateBoard = await prisma.codBoard.findFirst({
            where: {
              date: date,
              driverId: driver.id,
            },
            include: {
              expense: true,
            },
          });
      
          if (!dateBoard) {
            return res.status(404).json({
              error: `Your Board Is Not Available For ${date}`,
            });
        }
    
    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({
            error: 'Internal Server Error: ' + error,
        });
    }
}