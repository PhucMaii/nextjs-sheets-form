import { ORDER_STATUS, USER_ROLE } from '@/app/utils/enum';
import { PrismaClient } from '@prisma/client';
import { updateSingleInventoryItem } from '../admin/orderedItems/single';
import { sendEmail } from '../utils/email';
import { pusherServer } from '@/app/pusher';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

export function calculateNextPos(currentPos: number, result: string[]): string {
  const columns = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (currentPos < columns.length) {
    return columns[currentPos];
  }
  result.unshift(columns[currentPos % columns.length]);
  currentPos = Math.floor(currentPos / columns.length) - 1;
  if (currentPos < columns.length) {
    result.unshift(columns[currentPos]);
    return result.join('');
  }
  return calculateNextPos(currentPos, result);
}

export const checkHasClientOrder = async (id: number, deliveryDate: string) => {
  const prisma = new PrismaClient();

  const userOrders = await prisma.orders.findFirst({
    where: {
      userId: id,
      deliveryDate,
      status: {
        in: [
          ORDER_STATUS.COMPLETED,
          ORDER_STATUS.INCOMPLETED,
          ORDER_STATUS.DELIVERED,
        ],
      },
    },
    include: {
      items: true,
    },
  });

  return userOrders;
};

// export const createOrder = async (
//   body: any,
//   existingUser: any,
//   createdBy: string,
// ) => {
//   const prisma = new PrismaClient();

//   // Initialize new order
//   const newOrder = await prisma.orders.create({
//     data: {
//       deliveryDate: body['DELIVERY DATE'],
//       orderTime: body.orderTime,
//       userId: existingUser.id,
//       totalPrice: 0,
//       note: body['NOTE'],
//       status: ORDER_STATUS.INCOMPLETED,
//       createdBy,
//     },
//   });

//   let totalPrice = 0;
//   const itemList: any = [];
//   // Loop through each item from request and save it to order
//   for (const item of Object.keys(body)) {
//     if (item === 'DELIVERY DATE') {
//       continue;
//     }

//     if (item === 'NOTE') {
//       continue;
//     }

//     const itemData = await prisma.item.findFirst({
//       where: {
//         name: item,
//         categoryId: existingUser.categoryId,
//       },
//     });

//     // TODO: Check if item exist when Item page set up correctly

//     // if (!itemData?.inventoryItemId) {
//     //   return res.status(500).json({
//     //     error: `Item ${item} has no inventory item`,
//     //   });
//     // }
//     // Get inventory item
//     let inventoryItem: any = null;

//     if (itemData?.inventoryItemId) {
//       inventoryItem = await prisma.inventoryItem.findUnique({
//         where: {
//           id: itemData.inventoryItemId,
//         },
//       });
//     }

//     // TODO: Check if item exist when Item page set up correctly
//     // if (!inventoryItem) {
//     //   return res.status(500).json({
//     //     error: `Inventory Item for item ${item} does not exist`,
//     //   });
//     // }

//     if (itemData) {
//       totalPrice += itemData.price * body[item];

//       const orderedItems = await prisma.orderedItems.create({
//         data: {
//           name: itemData.name,
//           price: itemData.price,
//           orderId: newOrder.id,
//           quantity: body[item],
//           inventoryItemId: itemData.inventoryItemId,
//         },
//       });

//       itemList.push({
//         ...orderedItems,
//         totalPrice: itemData.price * body[item],
//       });

//       if (inventoryItem) {
//         // update inventory item
//         await prisma.inventoryItem.update({
//           where: {
//             id: inventoryItem.id,
//           },
//           data: {
//             quantity: inventoryItem.quantity - body[item],
//           },
//         });
//       }
//     }
//   }

//   // Update the order with the totalPrice
//   const updatedNewOrder = await prisma.orders.update({
//     where: {
//       id: newOrder.id,
//     },
//     data: {
//       totalPrice,
//     },
//     include: {
//       items: true,
//       user: {
//         include: {
//           category: true,
//         },
//       },
//     },
//   });

//   await pusherServer?.trigger('admin', 'incoming-order', {
//     ...updatedNewOrder,
//     items: itemList,
//     ...existingUser,
//     id: newOrder.id,
//     totalPrice,
//     category: existingUser.category,
//   });

//   const items = await prisma.item.findMany({
//     where: {
//       categoryId: existingUser.categoryId,
//     },
//   });
//   // Generate object of quantity, price, and totalPrice
//   const orderDetails = body;
//   for (const item of items) {
//     if (Object.prototype.hasOwnProperty.call(body, item.name)) {
//       orderDetails[item.name] = {
//         quantity: orderDetails[item.name],
//         price: item.price,
//         totalPrice: orderDetails[item.name] * item.price,
//       };
//     }
//   }

//   // Notify Email for admin
//   const isSendToAdmin = true;
//   await sendEmail(
//     existingUser,
//     updatedNewOrder.items,
//     newOrder.id,
//     body['DELIVERY DATE'],
//     isSendToAdmin,
//     body['NOTE'],
//   );

//   return updatedNewOrder;
// };

export const overrideOrder = async (
  user: any,
  orderId: number,
  newItems: any,
  newNote: string,
  updatedBy: string,
) => {
  const prisma = new PrismaClient();
  try {
    let total = 0;
    const itemList: any = [];
    for (const item of newItems) {
      const existingItem = await prisma.orderedItems.findUnique({
        where: {
          id: item.id,
        },
        include: {
          fifo: true,
          inventoryUnit: true,
        }
      });

      if (!existingItem) {
        continue;
      }
      // Update each item
      const newItem = await prisma.orderedItems.update({
        where: {
          id: item.id,
        },
        data: {
          quantity: item.quantity,
        },
      });

      // Update new total price
      total += newItem.quantity * newItem.price;
      itemList.push({
        ...newItem,
        totalPrice: newItem.quantity * newItem.price,
      });

      // Update inventory item
      if (existingItem?.fifo && existingItem.inventoryUnit) {
        await updateSingleInventoryItem(
          existingItem.fifo,
          existingItem.inventoryUnit,
          newItem.quantity,
          existingItem.quantity,
        );
      }
    }

    const updatedOrder = await prisma.orders.update({
      where: {
        id: orderId,
      },
      data: {
        totalPrice: total,
        note: newNote,
        isReplacement: updatedBy.split(' - ')[0] === 'Client' ? true : false,
        updateTime: new Date(),
        updatedBy,
      },
    });

    await sendEmail(
      user,
      itemList,
      orderId,
      updatedOrder.deliveryDate,
      true,
      newNote,
    );

    await pusherServer?.trigger('override-order', 'incoming-order', {
      ...updatedOrder,
      items: itemList,
      ...user,
      totalPrice: total,
      category: user.category,
      isReplacement: updatedBy.split(' - ')[0] === 'Client' ? true : false,
      id: updatedOrder.id,
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
  }
};

export const getCreatedBy = async (
  req: NextApiRequest,
  res: NextApiResponse,
  createdByRole: USER_ROLE,
) => {
  const prisma = new PrismaClient();
  const session: any = await getServerSession(req, res, authOptions);

  let createdBy = '';

  if (createdByRole === USER_ROLE.DRIVER) {
    const driverCreate: any = await prisma.driver.findUnique({
      where: {
        id: Number(session.user.id),
      },
    });

    createdBy = `Driver - ${driverCreate.name}`;
  } else if (
    createdByRole === USER_ROLE.ADMIN ||
    createdByRole === USER_ROLE.CLIENT
  ) {
    const userCreate: any = await prisma.user.findUnique({
      where: {
        id: Number(session.user.id),
      },
    });

    if (userCreate.role === USER_ROLE.ADMIN) {
      createdBy = `Admin - ${userCreate.clientName}`;
    }

    if (userCreate.role === USER_ROLE.CLIENT) {
      createdBy = `Client - ${userCreate.clientId}`;
    }
  }

  return createdBy;
};
