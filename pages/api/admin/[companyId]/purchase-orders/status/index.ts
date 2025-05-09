import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import withAdminAuthGuard from '../../../utils/withAdminAuthGuard';
import emailHandler from '@/pages/api/utils/email';
import { generatePurchaseOrderTemplate } from '@/config/email';
import { PO_STATUS } from '@/app/utils/enum';
const prisma = new PrismaClient();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // This API is only used to change to status CANCELLED or ORDERED
  try {
    if (req.method !== 'PUT') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { id, status } = req.body;

    const po = await prisma.pO.findUnique({
      where: {
        id: id,
      },
      include: {
        vendor: true,
        poItems: {
          include: {
            inventoryItem: true,
          },
        },
      },
    });

    if (!po) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    await prisma.pO.update({
      where: { id: id },
      data: {
        status: status,
      },
    });

    if (status === 'CANCELLED') {
      return res.status(200).json({ message: 'Purchase order status updated' });
    }

    if (
      po.vendor &&
      po.vendor.email &&
      po?.status !== PO_STATUS.ORDERED &&
      status === PO_STATUS.ORDERED
    ) {
      const poTemplate = generatePurchaseOrderTemplate(po.vendor, po);
      // Send email to vendor
      await emailHandler(
        po.vendor.email,
        `Supreme Sprouts Purchase Order Request #${po.poNumber}`,
        `Supreme Sprouts Purchase Order Request #${po.poNumber}`,
        poTemplate,
        'gm@supremesprout.com',
      );

      // Send email to gm@supremesprout.com
      // await emailHandler(
      //   'gm@supremesprout.com',
      //   `Supreme Sprouts Purchase Order Request #${po.poNumber}`,
      //   `Supreme Sprouts Purchase Order Request #${po.poNumber}`,
      //   poTemplate,
      // );
    }

    return res.status(200).json({ message: 'Email Sent Successfully' });
  } catch (error) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
};

export default withAdminAuthGuard(handler);
