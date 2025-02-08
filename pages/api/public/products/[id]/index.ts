import { IItemPreference } from '@/app/utils/type';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'GET') {
      return res.status(404).json({
        error: 'Your method is not supported',
      });
    }

    const { id } = req.query;

    if (!id) {
      return res.status(404).json({
        error: 'Product Id Not Provided',
      });
    }

    const prisma = new PrismaClient();

    const product: any = await prisma.itemPreference.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        inventoryItem: true,
      },
    });

    if (!product) {
      return res.status(404).json({
        error: 'Product Not Found',
      });
    }

    const relatedProducts = await getRelatedProducts(product);
    console.log(relatedProducts, 'relatedProducts');

    return res.status(200).json({
      data: product,
      relatedProducts,
      message: 'Fetch All Products Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
};

export default handler;

const getRelatedProducts = async (product: IItemPreference) => {
  try {
    const prisma = new PrismaClient();

    const productType = await prisma.itemType.findUnique({
      where: {
        id: product.typeId,
      },
      include: {
        itemPreferences: {
          where: {
            id: {
              not: product.id,
            },
          },
          include: {
            inventoryItem: true,
          },
        },
      },
    });

    const almostSameNameProducts: any = await prisma.itemPreference.findMany({
      where: {
        inventoryItem: {
          name: {
            contains: product.inventoryItem.name,
          },
        },
        id: {
          not: product.id,
        },
      },
    });

    const relatedProducts = almostSameNameProducts.filter(
      (item: IItemPreference) =>
        item.id !== product.id &&
        productType?.itemPreferences.every(
          (itemPreference: any) => itemPreference.id !== item.id,
        ),
    );

    return [...relatedProducts, ...(productType?.itemPreferences || [])];
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    throw new Error('Internal Server Error: ' + error);
  }
};
