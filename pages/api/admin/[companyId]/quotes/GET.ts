import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  const { companyId, quoteId }: any = req.query;
  
  try {
    if (quoteId) {
        const quote = await prisma.quote.findUnique({
            where: {
                id: Number(quoteId),
            },
            include: {
                items: {
                    include: {
                        inventoryItem: {
                            include: {
                                vendorItem: {
                                    include: {
                                        unit: true,
                                    },
                                },
                            },
                        },
                        inventoryUnit: true,
                    },
                },
                user: true,
            },
        });

        if (!quote) {
            return res.status(404).json({ error: "Quote not found" });
        }

        const formattedQuoteItem = quote.items.map((item) => {
            return {
                ...item,
                units: item.inventoryItem.vendorItem.flatMap((vendorItem) => vendorItem.unit),
            };
        });

        return res.status(200).json({
            message: "Quote fetched successfully",
            data: {
                ...quote,
                items: formattedQuoteItem,
            },
        });
    }

    const quotes = await prisma.quote.findMany({
        where: {
            companyId: Number(companyId),
        },
        include: {
            items: {
                include: {
                    inventoryItem: true,
                    inventoryUnit: true,
                },
            },
            user: true,
        },
    });

    return res.status(200).json({
        message: "Quotes fetched successfully",
        data: quotes,
    });
  } catch (error) {
    console.error('Internal Server Error: ', error);
    return res.status(500).json({ error: "Internal server error" });
  }
}