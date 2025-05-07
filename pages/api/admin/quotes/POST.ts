import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { quote, quoteItems, user } = req.body;

    // Check if user is new
    let quoteUser = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
    });

    if (!quoteUser) {
      // Create new user
      const password = await hash(user?.contactNumber || "N/A", 12);
      quoteUser = await prisma.user.create({
        data: {
          email: user.email,
          clientName: user.clientName,
          role: user.role,
          clientId: user.clientId,
          contactNumber: user.contactNumber,
          deliveryAddress: user.deliveryAddress,
          password: password,
        },
      });
    }

    // Create Quote
    const newQuote = await prisma.quote.create({
      data: {
        ...quote,
        userId: quoteUser.id,
      },
    });

    // Create Quote Items
    const newQuoteItems = await prisma.quoteItem.createMany({
      data: quoteItems.map((item: any) => ({
        ...item,
        quoteId: newQuote.id,
      })),
    });

    // TODO: Send email to user with quote details

    return res.status(200).json({
      message: "Quote created successfully",
      quote: newQuote,
      quoteItems: newQuoteItems,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}
