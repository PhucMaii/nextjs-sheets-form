import { PrismaClient } from '@prisma/client';
import { websiteItemCategory } from '@/app/lib/constant';
export default async function handler(req: any, res: any) {
  try {
    if (req.method !== 'GET') {
      return res.status(404).json({
        error: 'Your method is not supported',
      });
    }

    const prisma = new PrismaClient();

    const products = await prisma.item.findMany({
      where: {
        categoryId: websiteItemCategory, 
      },
      include: {
        inventoryItem: true,
        options: {
          include: {
            unit: true,
          },
        },
      }
    })

    // const products = await prisma.itemPreference.findMany({
    //   include: {
    //     inventoryItem: {
    //       include: {
    //         type: true,
    //       },
    //     },
    //   },
    //   orderBy: {
    //     typeId: 'asc',
    //   },
    // });

    return res.status(200).json({
      data: products,
      message: 'Fetch All Products Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
