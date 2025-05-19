import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const promotions = await prisma.promotion.findMany({
      where: {
        isWebsite: true,
      },
      include: {
        websiteItems: true,
      },
    });

    return res.status(200).json({ data: promotions, message: 'Promotions fetched successfully' });
  } catch (error) {
    console.error('Internal server error', error);
    return res.status(500).json({ error: 'Internal server error: ' + error });
  }
}