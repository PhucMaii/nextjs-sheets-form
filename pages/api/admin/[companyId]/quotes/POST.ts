import { generateQuoteTotal } from '@/app/utils/quote';
import { getCreatedBy } from '@/pages/api/import-sheets/utils';
import { getTodayDate } from '@/pages/api/utils/date';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { quote, quoteItems, user } = req.body;

    const { companyId }: any = req.query;

    // Check if user is new
    let quoteUser = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
    });
    
    const today = getTodayDate();
    const createdBy: any = await getCreatedBy(req, res);

    if (!quoteUser) {
      // Create new user
      const password = await hash(user?.contactNumber || 'N/A', 12);
      quoteUser = await prisma.user.create({
        data: {
          email: user.email,
          clientName: user.clientName,
          role: user.role,
          clientId: user.clientId,
          contactNumber: user.contactNumber,
          deliveryAddress: user.deliveryAddress,
          password: password,
          createdAt: today.dateAndTime,
          companyId: Number(companyId),
        },
      });
    }

    // Create Quote
    const quoteTotal = generateQuoteTotal(quoteItems);

    const newQuote = await prisma.quote.create({
      data: {
        ...quote,
        userId: quoteUser.id,
        total: quoteTotal.total,
        PST: quoteTotal.pst,
        GST: quoteTotal.gst,
        subtotal: quoteTotal.subtotal,
        createdBy: createdBy,
        createdAt: today.dateAndTime,
        companyId: Number(companyId),
      },
    });

    // Create Quote Items
    const newQuoteItems = await prisma.quoteItem.createMany({
      data: quoteItems.map((item: any) => ({
        inventoryItemId: item.inventoryItemId,
        inventoryUnitId: item.inventoryUnitId,
        quoteId: newQuote.id,
        price: item.price,
        quantity: item.quantity,
        companyId: Number(companyId),
      })),
    });

    // TODO: Send email to user with quote details

    return res.status(200).json({
      message: 'Quote created successfully',
      quote: newQuote,
      quoteItems: newQuoteItems,
    });
  } catch (error) {
    console.log('Internal server error', error);
    return res.status(500).json({ error: 'Internal server error: ' + error });
  }
}
