import { NextApiRequest, NextApiResponse } from 'next';
import { errorResponse, successResponse } from '../../utils/response';
import { prisma } from '@/lib/prisma';
import { getTodayDate } from '../../utils/date';
import { calculateNextDueDate } from '../create-transactions';
import { RECURRENCE_TYPE } from '@/app/utils/enum';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Get all automation rules
    const automationRules = await prisma.automationRules.findMany({
      where: {
        companyId: 1,
        isActive: true,
      },
      include: {
        inventoryItem: {
          include: {
            fifo: true,
            vendorItem: true,
          },
        },
      },
    });

    const today = getTodayDate();
    for (const rule of automationRules) {
      if (rule?.nextSubtractDate === today.date) {
          // Subtract the quantity
        if (rule.inventoryItem.fifo.length > 0) {
          await prisma.fifo.update({
            where: {
              inventoryItemId: Number(rule.inventoryItemId),
              id: Number(rule.inventoryItem.fifo[0].id),
            },
            data: {
              quantity: { decrement: rule.subtractQty },
            },
          });
        } else {
            await prisma.fifo.create({
                data: {
                    inventoryItemId: Number(rule.inventoryItemId),
                    quantity: -rule.subtractQty,
                    vendorItemId: Number(rule.inventoryItem.vendorItem[0].id),
                    createdAt: today.date,
                    createdBy: 'System',
                    companyId: 1,
                },
            });
        }

        // Calculate the next subtract date
        const nextSubtractDate = calculateNextDueDate(today.date, rule.frequency as RECURRENCE_TYPE);
        await prisma.automationRules.update({
          where: {
            id: rule.id,
          },
          data: {
            nextSubtractDate: nextSubtractDate,
          },
        });
      }
    }

    return successResponse(res, 'Automation rules updated successfully');
  } catch (error) {
    return errorResponse(res, error);
  }
}
