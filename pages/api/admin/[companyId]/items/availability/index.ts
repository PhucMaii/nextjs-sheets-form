import { NextApiRequest, NextApiResponse } from 'next';
import { IItem } from '@/app/utils/type';
import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';
import prisma from '@/client';

interface IBody {
  item: IItem;
  availability: boolean;
}

interface IQuery {
  companyId?: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'PUT') {
      return res.status(400).json({
        error: 'Your method is not supported',
      });
    }

    const { item, availability }: IBody = req.body;

    const { companyId }: IQuery = req.query;

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    const itemNameExisted = await prisma.item.findMany({
      where: {
        name: item.name,
        companyId: Number(companyId),
      },
    });

    if (itemNameExisted.length === 0) {
      return res.status(404).json({
        error: `No Item Found With Name ${item.name}`,
      });
    }

    // if (item.name.includes('BEAN')) {
    //   await prisma.item.updateMany({
    //     where: {
    //       name: item.name,
    //       subCategoryId: item.subCategoryId,
    //     },
    //     data: {
    //       availability,
    //     },
    //   });
    // } else {
    await prisma.item.updateMany({
      where: {
        inventoryItemId: item.inventoryItemId,
        companyId: Number(companyId),
      },
      data: {
        availability,
      },
    });
    // }

    return res.status(200).json({
      message: 'Item Availability Updated Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
};

export default withAdminAuthGuard(handler);
