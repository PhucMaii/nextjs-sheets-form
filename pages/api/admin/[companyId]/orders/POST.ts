import {
  EMPLOYEE_ROLE,
  ORDER_STATUS,
  USER_CATEGORIZED,
} from '@/app/utils/enum';
import { PaymentStatus, User } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { OrderedItems, UserType } from '@/app/utils/type';
import { sendEmail } from '@/pages/api/utils/email';
import { pusherServer } from '@/app/pusher';
import {
  checkOrderDeliveryDateValid,
  convertToPSTDate,
  getTodayDate,
  normalizeDate,
} from '@/pages/api/utils/date';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { checkHasClientOrder } from '@/pages/api/import-sheets/utils';
import { generateOrderTotalPrice } from '@/pages/api/admin/[companyId]/orderedItems/PUT';
import { categorizeUser } from '@/pages/api/utils/user';
import { createOrderedItems } from '@/pages/api/utils/orderedItems';
import prisma from '@/client';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '8mb', // Set desired value here
    },
  },
};

interface BodyTypes {
  deliveryDate: string;
  scheduleOrderIds: number[];
  createdAt: string;
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const contentLength = req.headers['content-length'];
    console.log('Content-Length Header:', contentLength);
    const requestBodySize = Buffer.byteLength(JSON.stringify(req.body));
    console.log('Request Body Size:', requestBodySize, 'bytes');
    const { deliveryDate, scheduleOrderIds } = req.body as BodyTypes;

    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({
        error: 'Company ID is required',
      });
    }

    // Get person create info
    const session: any = await getServerSession(req, res, authOptions);
    const adminCreate: any = session?.user;

    // Update to start track inventory when admin start pre order
    // const { date, time } = getTodayDate();
    // const isTrackInventoryActionTaken = await prisma.action.findFirst({
    //   where: {
    //     name: ACTION.TRACK_INVENTORY,
    //     date,
    //   },
    // });

    // if (!isTrackInventoryActionTaken) {
    //   await prisma.action.create({
    //     data: {
    //       name: ACTION.TRACK_INVENTORY,
    //       date,
    //       createdAt: `${time} ${date}`,
    //       createdBy: `Admin - ${adminCreate?.clientName}`,
    //     },
    //   });
    // }

    const isSendToAdmin = false;
    const updatedOrderList: any = [];

    const scheduleOrderList: any = await prisma.scheduleOrders.findMany({
      where: {
        id: {
          in: scheduleOrderIds,
        },
      },
      include: {
        items: {
          include: {
            inventoryItem: true,
            inventoryUnit: true,
          },
        },
        user: true,
        positionIndex: true,
      },
      orderBy: {
        positionIndex: {
          index: 'asc',
        },
      },
    });

    for (const scheduleOrder of scheduleOrderList) {
      const returnOrder = {
        id: scheduleOrder.id,
        // items: scheduleOrder.items.map((item: any) => {
        //   return {
        //     name: item.name,
        //     quantity: item.quantity,
        //     price: item.price,
        //   };
        // }),
        // totalPrice: scheduleOrder.totalPrice,
        // userId: scheduleOrder.user.id,
        // createdAt: createdAt
      };

      try {
        // Check if the order has no items existed
        if (scheduleOrder.totalPrice === 0) {
          await pusherServer?.trigger(
            `admin-schedule-order-${companyId}`,
            'pre-order',
            returnOrder,
          );
          console.log({
            zeroTotalPrice: {
              id: scheduleOrder.id,
              user: scheduleOrder.user.clientId,
              deliveryDate,
              clientName: scheduleOrder.user.clientName,
            },
          });
          continue;
        }

        // Check has user order for today, if yes then skip that client
        const existingOrder: any = await checkHasClientOrder(
          scheduleOrder.user.id,
          deliveryDate,
        );

        if (existingOrder) {
          await pusherServer?.trigger(
            `admin-schedule-order-${companyId}`,
            'pre-order',
            {
              id: existingOrder?.id,
            },
          );
          console.log({
            alreadyOrder: {
              id: scheduleOrder.id,
              user: scheduleOrder.user.clientId,
              deliveryDate,
              clientName: scheduleOrder.user.clientName,
            },
          });
          continue;
        }

        // Check if user is inactive
        if (scheduleOrder?.user?.type === USER_CATEGORIZED.INACTIVE) {
          await pusherServer?.trigger(
            `admin-schedule-order-${companyId}`,
            'pre-order',
            {
              id: returnOrder?.id,
            },
          );
          console.log({
            inactiveOrder: {
              id: scheduleOrder.id,
              user: scheduleOrder.user.clientId,
              deliveryDate,
              clientName: scheduleOrder.user.clientName,
            },
          });
          continue;
        }

        // Check is user has blocked off for selected date
        const unavailableRanges = await prisma.dayRange.findMany({
          where: {
            userId: scheduleOrder.userId,
          },
        });

        let trackIndex = 0;
        const deliveryDateTypeDate = normalizeDate(new Date(deliveryDate));
        // const deliveryDateTypeDate = convertToPSTDate(deliveryDate);
        for (const unavailableRange of unavailableRanges) {
          // const normalizedStartDate = normalizeDate(unavailableRange.startDate);
          // const normalizedEndDate = normalizeDate(unavailableRange.endDate);

          const normalizedStartDate = convertToPSTDate(
            unavailableRange.startDate,
          );
          const normalizedEndDate = convertToPSTDate(unavailableRange.endDate);

          // normalizedEndDate.setDate(normalizedEndDate.getDate() - 1);
          if (
            deliveryDateTypeDate >= normalizedStartDate &&
            deliveryDateTypeDate <= normalizedEndDate
          ) {
            break;
          }
          trackIndex++;
        }

        if (trackIndex <= unavailableRanges.length - 1) {
          await pusherServer?.trigger(
            `admin-schedule-order-${companyId}`,
            'pre-order',
            {
              id: returnOrder?.id,
            },
          );
          console.log({
            duringBlocking: {
              id: scheduleOrder.id,
              user: scheduleOrder.user.clientId,
              deliveryDate,
              clientName: scheduleOrder.user.clientName,
            },
          });
          continue;
        }

        const role =
          session?.user?.role === EMPLOYEE_ROLE.SUPER_ADMIN
            ? 'S Admin'
            : 'Admin';

        const newOrder: any = await createOrder(
          Number(companyId),
          scheduleOrder.user,
          scheduleOrder.items,
          deliveryDate,
          `${role} - ${adminCreate.name}`,
          '',
        );

        await sendEmail(
          scheduleOrder.user,
          newOrder,
          newOrder.id,
          deliveryDate,
          isSendToAdmin,
        );
        updatedOrderList.push(newOrder);

        await pusherServer?.trigger(
          `admin-schedule-order-${companyId}`,
          'pre-order',
          {
            id: newOrder?.id,
          },
        );
        console.log({
          successful: {
            id: scheduleOrder.id,
            user: scheduleOrder.user.clientId,
            deliveryDate,
            clientName: scheduleOrder.user.clientName,
          },
        });
      } catch (error: any) {
        console.error('Fail to pre order: ', error);
        // await pusherServer?.trigger(
        //   'admin-schedule-order',
        //   'pre-order',
        //   scheduleOrder,
        // );
        console.log({ fail: scheduleOrder });
        continue;
      }
    }

    return res.status(201).json({
      data: updatedOrderList,
      message: 'Pre Order Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error.message,
    });
  }
}

export const createOrder = async (
  companyId: number,
  user: User | UserType,
  items: OrderedItems[],
  deliveryDate: string,
  createdBy: string,
  note: string = '',
  shippingFee: number = 0,
  status: ORDER_STATUS = ORDER_STATUS.INCOMPLETED,
  enteredOrderAt: string = '',
) => {
  try {
    // Check if any item quantity is decimal number
    for (const item of items) {
      if (item.quantity % 1 !== 0) {
        throw new Error('Invalid Quantity');
      }

      if (item.quantity < 1) {
        throw new Error('Invalid Quantity');
      }
    }

    // Check if user is inactive
    if (user?.type === USER_CATEGORIZED.INACTIVE) {
      throw new Error('Client Account Is INACTIVE');
    }

    // Check if user order within invalid date
    if (
      createdBy.split(' - ')[0] === 'Client' ||
      createdBy.split(' - ')[0] === 'Guest'
    ) {
      const isValidDate = checkOrderDeliveryDateValid(deliveryDate);
      if (!isValidDate.ok) {
        throw new Error(isValidDate.message);
      }
    }

    const total = generateOrderTotalPrice(items, shippingFee);
    const { date, time } = getTodayDate();

    // initialize order
    const newOrder = await prisma.orders.create({
      data: {
        deliveryDate,
        note,
        status,
        userId: user.id,
        subTotal: total.subTotal,
        PST: total.PST,
        GST: total.GST,
        shippingFee,
        discount: total.discount,
        totalPrice: total.totalPrice,
        isAffectInventory: true,
        orderTime: `${date} ${time}`,
        createdBy,
        companyId,
        paymentStatus: PaymentStatus.Unpaid,
        enteredOrderAt,
      },
    });

    // Add timeline for order
    const newTimeline = await prisma.orderTimeline.create({
      data: {
        orderId: newOrder.id,
      },
    });

    // Add actions
    await prisma.orderAction.create({
      data: {
        timelineId: newTimeline.id,
        title: `${createdBy} created this order for ${deliveryDate}`,
        createdAt: `${date} ${time}`,
        createdBy,
        posIndex: 1,
      },
    });

    const newOrderedItems = await createOrderedItems(
      companyId,
      newOrder,
      items,
      createdBy,
    );
    console.log(newOrderedItems);

    let comment = '### Items\n';
    for (const item of newOrderedItems) {
      comment += `x${item.quantity} ${item.name}\n`;
    }

    const totalItems = newOrderedItems.reduce((acc: number, item: any) => {
      return acc + item.quantity;
    }, 0);

    // Add actions
    await prisma.orderAction.create({
      data: {
        timelineId: newTimeline.id,
        title: `There were ${totalItems} items added to the order`,
        comment,
        createdAt: `${date} ${time}`,
        createdBy,
        posIndex: 2,
      },
    });

    const updatedOrder = await prisma.orders.findUnique({
      where: {
        id: newOrder.id,
      },
      include: {
        items: {
          include: {
            inventoryItem: true, // for calculate tax
            inventoryUnit: true,
          },
        },
        user: true,
      },
    });

    // Update user type
    const userType = await categorizeUser(user.id);
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        type: userType,
      },
    });

    return updatedOrder;
  } catch (error: any) {
    console.log('Internal Server Error - Fail to create order: ', error);
    return error;
  }
};

// export const createOrderedItems = async (
//   order: Orders,
//   items: any,
//   createdBy: string = '',
// ) => {
//   //   // STEP 1: Loop through each item
//   const inventoryItems = await prisma.inventoryItem.findMany({
//     include: {
//       vendorItem: {
//         include: {
//           unit: true,
//         },
//       },
//       fifo: {
//         include: {
//           vendorItem: {
//             include: {
//               unit: true,
//             },
//           },
//         },
//       },
//     },
//   });

//   // // Check is order valid to affect inventory
//   const isValidToCheckInventory = await checkOrderValidToAffectInventory(
//     order.deliveryDate,
//   );

//   const newOrderedItems = [];
//   const allDeletedFifoIds = [];
//   for (const item of items) {
//     const targetedItem = inventoryItems.find(
//       (inventoryItem) => inventoryItem.id === item.inventoryItemId,
//     );

//     // console.log(item, 'item');

//     if (!targetedItem && item.isCustomAmount) {
//       newOrderedItems.push({
//         orderId: order.id,
//         name: item.name,
//         price: item.price,
//         cost: item.cost,
//         profit: item.price - item.cost,
//         quantity: item.quantity,
//         isCustomAmount: item.isCustomAmount,
//       });
//       continue;
//     }

//     if (!targetedItem) {
//       console.error('Conflict Inventory Item Not Found');
//       continue;
//     }

//     let unitId = item.inventoryUnitId;
//     // If item is custom amount and is assigned to a new unit
//     if (item.inventoryUnitId < 1) {
//       const dbUnits = await prisma.inventoryUnit.findMany({
//         where: {
//           vendorItemId: item.inventoryUnit.vendorItemId,
//         },
//       });
//       const updatedAt = getTodayDate();
//       await checkAndUpdateUnits(
//         dbUnits,
//         item.units,
//         item.inventoryUnit.vendorItemId,
//         `${updatedAt.date} ${updatedAt.time}`,
//         createdBy,
//       );

//       const targetUnit = await prisma.inventoryUnit.findFirst({
//         where: {
//           vendorItemId: item.inventoryUnit.vendorItemId,
//           ratio: item.inventoryUnit.ratio,
//         },
//       });

//       unitId = targetUnit?.id;
//     }

//     const allUnits = await getAllUnitsByInventoryItemId(item.inventoryItemId);
//     const itemUnit = allUnits?.find((unit: any) => unit.id === unitId);

//     // console.log({ targetedItem, item }, 'targetedItem');
//     // CASE 1:Check if vendor item has no batch
//     if (targetedItem.fifo.length === 0) {
//       const newFifo = await prisma.fifo.create({
//         data: {
//           inventoryItemId: targetedItem.id,
//           vendorItemId: targetedItem.vendorItem[0].id,
//           quantity: isValidToCheckInventory ? -item.quantity : 0,
//           createdAt: order.orderTime,
//           createdBy: order?.createdBy || '',
//         },
//         include: {
//           vendorItem: true,
//         },
//       });

//       // Update vendor item quantity
//       if (isValidToCheckInventory) {
//         await prisma.vendorItem.update({
//           where: {
//             id: targetedItem.vendorItem[0].id,
//           },
//           data: {
//             quantity: -item.quantity,
//           },
//         });
//       }

//       // We don't know the cost at this stage since there is no batch available yet.
//       newOrderedItems.push({
//         orderId: order.id,
//         fifoId: newFifo.id,
//         cost: itemUnit?.unitPrice || 0,
//         profit: item.price - (itemUnit?.unitPrice || 0),
//         name: item.name,
//         price: item.price,
//         quantity: item.quantity,
//         inventoryUnitId: unitId,
//         inventoryItemId: item.inventoryItemId,
//         isCustomAmount: item?.isCustomAmount || false,
//       });
//     } else {
//       // CASE 2: Check if vendor item has batch
//       // STEP 2: Get and Sorted from latest date all FIFO from inventory item
//       const itemFifo = targetedItem.fifo.map((fifo) => {
//         const createdAt = fifo.createdAt.split(' ')[1];
//         return { ...fifo, createdAt };
//       });

//       // Descending fifo - first item would be the latest
//       const sortedFifo = sortByDeliveryDate(itemFifo, 'createdAt');
//       if (isValidToCheckInventory) {
//         // STEP 3: Use while loop to identify which fifo should be used
//         //   itemQuantity = item.quantity * item.unit.ratio
//         //   while (itemQuantity >= fifo.quantity)
//         //     move to next FIFO
//         let fifoIndex = 0;
//         const deletedFifoIds = [];

//         let itemQuantity = item.quantity * item.inventoryUnit.ratio;
//         // let fifoQuantityLeft = itemQuantity;
//         while (fifoIndex < sortedFifo.length - 1) {
//           if (itemQuantity >= sortedFifo[fifoIndex].quantity) {
//             deletedFifoIds.push(sortedFifo[fifoIndex].id);
//             itemQuantity -= sortedFifo[fifoIndex].quantity;
//             fifoIndex++;
//           } else {
//             break;
//           }
//         }

//         // STEP 4: fifo.quantity - itemQuantity
//         // If users order more than stock has - fifoIndex should reach the second last item
//         await prisma.fifo.update({
//           where: {
//             id: sortedFifo[fifoIndex].id,
//           },
//           data: {
//             quantity: sortedFifo[fifoIndex].quantity - itemQuantity,
//           },
//         });

//         // STEP 5: vendorItem.quantity - (item.quantity * item.inventoryUnit.ratio)
//         // Update Vendor Item Quantity
//         const targetVendorItem = await prisma.vendorItem.findFirst({
//           where: {
//             id: sortedFifo[fifoIndex].vendorItemId,
//           },
//         });

//         if (!targetVendorItem) {
//           console.error('COnflict vendor item');
//           continue;
//         }

//         await prisma.vendorItem.update({
//           where: {
//             id: sortedFifo[fifoIndex].vendorItemId,
//           },
//           data: {
//             quantity:
//               targetVendorItem.quantity -
//               item.quantity * item.inventoryUnit.ratio,
//           },
//         });

//         await prisma.orderedItems.updateMany({
//           where: {
//             fifoId: {
//               in: deletedFifoIds,
//             },
//           },
//           data: {
//             fifoId: sortedFifo[fifoIndex].id,
//           },
//         });

//         allDeletedFifoIds.push(...deletedFifoIds);

//         const cost = sortedFifo[fifoIndex]?.price
//           ? sortedFifo[fifoIndex].price * itemUnit?.ratio
//           : itemUnit?.unitPrice || 0;

//         console.log(itemUnit, 'item unit');
//         console.log(sortedFifo[fifoIndex].price, 'sortedFifo[fifoIndex].price');

//         // STEP 6: Create ordered item with that fifo id attached
//         newOrderedItems.push({
//           orderId: order.id,
//           fifoId: sortedFifo[fifoIndex].id,
//           name: item.name,
//           cost: cost,
//           profit: item.price - cost,
//           price: item.price,
//           quantity: item.quantity,
//           isShowDiscount: item?.isShowDiscount,
//           prevPrice: item?.prevPrice,
//           inventoryUnitId: unitId,
//           inventoryItemId: item.inventoryItemId,
//           isCustomAmount: item?.isCustomAmount || false,
//         });
//       } else {
//         const cost = sortedFifo[0]?.price
//           ? sortedFifo[0].price
//           : itemUnit?.unitPrice || 0;

//         newOrderedItems.push({
//           orderId: order.id,
//           fifoId: sortedFifo[0].id,
//           name: item.name,
//           cost: cost,
//           profit: item.price - cost,
//           price: item.price,
//           quantity: item.quantity,
//           isShowDiscount: item?.isShowDiscount,
//           prevPrice: item?.prevPrice,
//           inventoryUnitId: unitId,
//           inventoryItemId: item.inventoryItemId,
//           isCustomAmount: item?.isCustomAmount || false,
//         });
//       }
//     }

//     if (allDeletedFifoIds.length > 0) {
//       await prisma.fifo.deleteMany({
//         where: {
//           id: {
//             in: allDeletedFifoIds,
//           },
//         },
//       });
//     }
//   }

//   await prisma.orderedItems.createMany({
//     data: newOrderedItems,
//   });

//   return newOrderedItems;
// };
