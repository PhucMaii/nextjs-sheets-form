import { ICartItem } from '@/app/utils/type';
import { generateOrderTotalPrice } from '@/pages/api/admin/orderedItems/PUT';
import { getTodayDate } from '@/pages/api/utils/date';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IBody {
  item: ICartItem;
  userId?: number;
  cartId: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    if (req.method !== 'POST') {
      return res.status(404).json({
        error: 'Your method is not supported',
      });
    }

    const prisma = new PrismaClient();

    const { item, userId, cartId }: IBody = req.body;

    // Get the unit of ratio 1 for new item
    const existingItemPreference = await prisma.itemPreference.findUnique({
      where: {
        id: item.itemPreferenceId,
      },
      include: {
        inventoryItem: {
          include: {
            vendorItem: {
              where: {
                unit: {
                  some: {}, // Ensure vendorItem has some inventory units
                },
              },
              include: {
                unit: {
                  where: {
                    ratio: 1,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!existingItemPreference) {
      return res.status(404).json({
        error: 'Item Not Found',
      });
    }

    const today = getTodayDate();
    // Check if item is existed in cart, then increase the quantity
    if (cartId) {
      const selectedCart = await prisma.cart.findUnique({
        where: {
          id: cartId,
        },
      });

      // If cart found -> find if item exists then add to existed cart
      // Else go to create cart
      if (selectedCart) {
        const existingItem = await prisma.cartItem.findFirst({
          where: {
            cartId,
            itemPreferenceId: item.itemPreferenceId,
          },
        });

        if (existingItem) {
          await prisma.cartItem.update({
            where: {
              id: existingItem.id,
            },
            data: {
              quantity: existingItem.quantity + item.quantity,
            },
          });
        } else {
          // Create new item
          await prisma.cartItem.create({
            data: {
              quantity: item.quantity,
              itemPreferenceId: item.itemPreferenceId,
              cartId: selectedCart.id,
              createdAt: `${today.date} ${today.time}`,
              createdBy: 'Guest',
              inventoryUnitId:
                existingItemPreference.inventoryItem.vendorItem[0].unit[0].id,
            },
          });
        }

        const updatedCart = await updateCartTotalPrice(selectedCart.id);

        return res.status(201).json({
          data: updatedCart,
          message: 'Add Item Into Cart Successfully',
        });
      }
    }

    // CASE: No cart id available
    let cart = null;
    // Prioritize if user id is available because it couldn't be changed by user
    if (userId) {
      cart = await prisma.cart.findFirst({
        where: {
          userId,
        },
      });

      if (!cart) {
        cart = await prisma.cart.create({
          data: {
            subtotal: 0,
            totalPrice: 0,
            discount: 0,
            shippingFee: 0,
            PST: 0,
            GST: 0,
            note: '',
            userId,
            createdAt: `${today.date} ${today.time}`,
            createdBy: 'Guest',
          },
        });
      }
    } else {
      // If no user id available - init cart without user id
      cart = await prisma.cart.create({
        data: {
          subtotal: 0,
          totalPrice: 0,
          discount: 0,
          shippingFee: 0,
          PST: 0,
          GST: 0,
          note: '',
          createdAt: `${today.date} ${today.time}`,
          createdBy: 'Guest',
        },
      });
    }

    // Create new item
    await prisma.cartItem.create({
      data: {
        quantity: item.quantity,
        itemPreferenceId: item.itemPreferenceId,
        cartId: cart.id,
        createdAt: `${today.date} ${today.time}`,
        createdBy: 'Guest',
        inventoryUnitId:
          existingItemPreference.inventoryItem.vendorItem[0].unit[0].id,
      },
    });

    const updatedCart = await updateCartTotalPrice(cart.id);

    return res.status(201).json({
      message: 'Add Item Into Cart Successfully',
      data: updatedCart,
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}

export const updateCartTotalPrice = async (cartId: number) => {
  try {
    const prisma = new PrismaClient();

    const allCartItems = await prisma.cartItem.findMany({
      where: {
        cartId,
      },
      include: {
        itemPreference: {
          include: {
            inventoryItem: true,
          },
        },
      },
    });

    if (allCartItems.length === 0) {
      await prisma.cart.update({
        where: {
          id: cartId,
        },
        data: {
          subtotal: 0,
          totalPrice: 0,
          PST: 0,
          GST: 0,
          discount: 0,
          shippingFee: 0,
        },
      });

      return null;
    }

    // Format the item to generate total
    const formattedItems = allCartItems.map((item: any) => {
      return {
        ...item.itemPreference,
        quantity: item.quantity,
      };
    });

    // Generate and update cart total
    const total = generateOrderTotalPrice(formattedItems);
    const returnCart = await prisma.cart.update({
      where: {
        id: cartId,
      },
      data: {
        subtotal: total.subTotal,
        totalPrice: total.totalPrice,
        PST: total.PST,
        GST: total.GST,
        discount: total.discount,
        shippingFee: 0,
      },
      include: {
        items: {
          include: {
            itemPreference: {
              include: {
                inventoryItem: true,
              },
            },
          },
        },
      },
    });

    return returnCart;
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    throw new Error('Something went wrong. Please try again later', error);
  }
};
