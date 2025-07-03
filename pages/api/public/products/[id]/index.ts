import { websiteItemCategory } from '@/app/lib/constant';
import { IItem } from '@/app/utils/type';
import prisma from '@/client';
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

    const product: any = await prisma.item.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        inventoryItem: true,
        options: true,
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

const getRelatedProducts = async (product: IItem) => {
  const relatedProducts = await prisma.item.findMany({
    where: {
      categoryId: websiteItemCategory,
      inventoryItem: {
        typeId: product.inventoryItem.typeId,
      },
      id: {
        not: product.id,
      },
    },
    include: {
      inventoryItem: true,
      options: true,
    },
    take: 10,
  });

  return relatedProducts;
};

export default handler;
