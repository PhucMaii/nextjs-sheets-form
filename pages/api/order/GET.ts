import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
    try {
        const prisma = new PrismaClient();

        const session: any = await getServerSession(req, res, authOptions);

      const existingUser = await prisma.user.findUnique({
        where: {
          id: Number(session?.user?.id),
        },
      });

      if (!existingUser) {
        return res.status(401).json({ error: 'User Not Found' });
      }

      const userOrders = await prisma.orders.findMany({
        where: {
            userId: existingUser.id
        }
      });

      return res.status(200).json({
        data: {
            user: existingUser,
            userOrders,
        },
        message: 'Fetch User Orders Successfully'
      })

    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({
            error: 'Internal Server Error: '  + error
        })
    }
}