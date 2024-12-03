import { getUserInfo } from '@/pages/api/utils/auth';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { checkAndUpdateUnits, createFifo } from './POST';
import { IInventoryUnit } from '@/app/utils/type';

interface IPurchasedItem {
  id: number; // Inventory Item Id
  name: string;
  quantity: number;
  unitPrice: number;
  vendorId: number;
  unit: IInventoryUnit;
  units?: IInventoryUnit[];
  inventoryItem: any;
  vendorItemId: number;
}

interface IBody {
  id: number;
  amount: number;
  description: string;
  date: string;
  paymentMethodId: number;
  spentBy: string;
  invoice: string;
  // oldItemIds: number[]; // Ordered items ids
  oldItems: IPurchasedItem[];
  updatedItems: IPurchasedItem[];
  updatedAt: string;
  isAffectQuantity?: boolean;
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const {
      id,
      amount,
      invoice,
      description,
      date,
      paymentMethodId,
      spentBy,
      oldItems,
      updatedItems,
      updatedAt,
      isAffectQuantity,
    }: IBody = req.body;

    const existingExpense = await prisma.expense.findUnique({
      where: {
        id: id,
      },
      include: {
        orderedItems: {
          include: {
            fifo: true,
          },
        },
      },
    });

    if (!existingExpense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    // Check if invoice number already exists
    if (invoice !== existingExpense.invoice) {
      const existingInvoice = await prisma.expense.findFirst({
        where: {
          invoice: invoice,
          date: date,
          vendors: {
            some: {
              vendorId: updatedItems[0].vendorId,
            },
          },
        },
      });

      if (existingInvoice) {
        return res.status(400).json({ error: 'Invoice Number already exists' });
      }
    }

    // Update expense
    await prisma.expense.update({
      where: {
        id: id,
      },
      data: {
        amount: amount,
        description: description,
        date: date,
        invoice,
        paymentMethodId: paymentMethodId,
        spentBy: spentBy,
      },
      include: {
        orderedItems: {
          include: {
            fifo: true,
          },
        },
      },
    });

    const oldItemIds = oldItems.map((item: any) => {
      return item.id;
    });

    if (oldItemIds.length > 0 && updatedItems.length > 0) {
      const user = await getUserInfo(req, res);
      const createdBy = `Admin - ${user?.clientName}`;
      // Delete all items and create new ones
      await prisma.orderedItems.deleteMany({
        where: {
          id: {
            in: oldItemIds,
          },
        },
      });

      const vendorItems = await prisma.vendorItem.findMany({
        include: {
          unit: true,
        },
      });

      // Update inventory units
      for (const item of updatedItems) {
        const vendorItem = vendorItems.find((vendorItem: any) => {
          return vendorItem.id === item?.vendorItemId;
        });

        if (vendorItem) {
          await checkAndUpdateUnits(
            vendorItem.unit,
            item?.units || [],
            vendorItem.id,
            updatedAt,
            createdBy,
          );
        }
      }

      // Item Existed In Bill Before
      const existingOrderedItems = updatedItems
        .filter((item: any) => {
          return item.id > 0;
        })
        .map((item: any) => {
          const existingItems = existingExpense.orderedItems.find(
            (orderedItem: any) => {
              return orderedItem.id === item.id;
            },
          );

          return {
            expenseId: id,
            name: item.name,
            quantity: item.quantity,
            price: item.unitPrice,
            fifoId: existingItems?.fifoId || null,
            unit: item?.unit,
            inventoryItemId: item.inventoryItem.id,
            vendorItemId: item.id,
          };
        });

      // Just added ordered items in current bill
      const newOrderedItems = updatedItems
        .filter((item: any) => {
          return item.id < 1;
        })
        .map((item: any) => {
          return {
            ...item,
            inventoryItemId: item.inventoryItem.id,
            id: item.vendorItemId,
          };
        });

      if (isAffectQuantity) {
        // Handle if db conflict
        const allUnits = await prisma.inventoryUnit.findMany({});

        const existingOrderedItemsFifoId = existingOrderedItems
          .map((item: any) => {
            return item?.fifoId || null;
          })
          .filter((id: any) => {
            return id !== null;
          });

        await prisma.fifo.deleteMany({
          where: {
            id: {
              in: existingOrderedItemsFifoId,
            },
          },
        });

        const existingOrderedItemsFifo = existingOrderedItems.map(
          (item: any) => {
            let unit = item?.unit || null;
            if (!unit) {
              unit = allUnits.find((browsingUnit: any) => {
                return browsingUnit.vendorItemId === item.vendorItemId;
              });
            }
            return {
              ...item,
              unit,
              id: item.vendorItemId,
            };
          },
        );

        console.log(
          { updatedItems, existingOrderedItems, newOrderedItems },
          'updatedItems',
        );
        await createFifo(
          [...newOrderedItems, ...existingOrderedItemsFifo],
          updatedAt,
          createdBy,
        );
      }

      const newFifo = await prisma.fifo.findMany({
        where: {
          createdAt: updatedAt,
          createdBy,
        },
      });

      const createdNewOrderedItems = newOrderedItems.map((item: any) => {
        return {
          expenseId: id,
          name: item.name,
          quantity: item.quantity,
          price: item.unitPrice,
          fifoId: newFifo.find((fifo: any) => {
            return fifo.vendorItemId === item.id;
          })?.id,
        };
      });

      const createdExistingOrderedItems = existingOrderedItems.map(
        (item: any) => {
          return {
            expenseId: id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            fifoId: item.fifoId,
          };
        },
      );
      await prisma.orderedItems.createMany({
        data: [...createdNewOrderedItems, ...createdExistingOrderedItems],
      });

      // const updatedExpense = await prisma.expense.findUnique({
      //   where: {
      //     id: id,
      //   },
      //   include: {
      //     orderedItems: {
      //       include: {
      //         fifo: true,
      //       },
      //     },
      //   },
      // });

      // if (!updatedExpense) {
      //   return res.status(404).json({ error: 'Conflict Expense not found' });
      // }

      // if (
      //   !updatedExpense.orderedItems ||
      //   updatedExpense.orderedItems.length === 0
      // ) {
      //   return res
      //     .status(400)
      //     .json({ error: 'Conflict Ordered Items not found' });
      // }

      // If new item is added while editing, it have to force user to choose affect quantity
      // if (isAffectQuantity) {
      //   const allFifos = await prisma.fifo.findMany({
      //     where: {
      //       createdAt: updatedAt,
      //       createdBy,
      //     }
      //   })

      //   for (const item of updatedExpense.orderedItems) {
      //     // Handle exception if there is conflict in db

      //     let itemFifo: any = null;
      //     if (item.fifoId && item.fifoId > 0 && !item?.fifo) {
      //       console.log('ACCESS SEARCH FIFO')
      //       itemFifo = allFifos.find((fifo: any) => {
      //         return fifo.vendorItemId === item?.vendorItemId;
      //       });
      //     }

      //     const itemExistedInventory = vendorItems.find((vendorItem: any) => {
      //       if (itemFifo) {
      //         return vendorItem.id === itemFifo?.vendorItemId;
      //       }
      //       return vendorItem.id === item?.fifo?.vendorItemId;
      //     });

      //     console.log(
      //       { item, itemExistedInventory }, 'itemExistedInventory',)

      //     // Item already existed in inventory -> Update quantity
      //     if (itemExistedInventory) {
      //       const itemInBill = existingExpense.orderedItems.find(
      //         (orderedItem: any) => {
      //           return orderedItem.id === item.id;
      //         },
      //       );
      //       const newQuantity =
      //         itemExistedInventory?.quantity -
      //         (itemInBill?.quantity || 0) +
      //         item.quantity;
      //       await prisma.vendorItem.update({
      //         where: {
      //           id: itemExistedInventory.id,
      //         },
      //         data: {
      //           quantity: newQuantity,
      //         },
      //       });
      //     } else {
      //       // const vendor: any = await prisma.vendorExpense.findFirst({
      //       //   where: {
      //       //     expenseId: existingExpense.id,
      //       //   },
      //       // });
      //       // // // New item -> Create fifo
      //       // const newInventoryItem = await prisma.inventoryItem.create({
      //       //   data: {
      //       //     name: item.name,
      //       //     createdAt: updatedAt,
      //       //     createdBy: `Admin - ${user?.clientName}`,
      //       //   },
      //       // });

      //       // const newVendorItem = await prisma.vendorItem.create({
      //       //   data: {
      //       //     inventoryItemId: newInventoryItem.id,
      //       //     vendorId: vendor?.vendorId,
      //       //     quantity: item.quantity,
      //       //     createdAt: updatedAt,
      //       //     createdBy: `Admin - ${user?.clientName}`,
      //       //   },
      //       // });

      //       // const itemExistedInBill = updatedItems.find((item: any) => {
      //       //   return item.name === newInventoryItem.name;
      //       // });

      //       // if (itemExistedInBill && itemExistedInBill.units) {
      //       //   const newUnits = itemExistedInBill?.units.map((unit: any) => {
      //       //     return {
      //       //       unit: unit.unit,
      //       //       unitPrice: unit.unitPrice,
      //       //       ratio: unit?.ratio || 1,
      //       //       vendorItemId: newVendorItem.id,
      //       //       createdAt: updatedAt,
      //       //       createdBy: `Admin - ${user?.clientName}`,
      //       //     };
      //       //   });

      //       //   await prisma.inventoryUnit.createMany({
      //       //     data: newUnits,
      //       //   });

      //       //   await prisma.fifo.create({
      //       //     data: {
      //       //       inventoryItemId: newInventoryItem.id,
      //       //       vendorItemId: newVendorItem.id,
      //       //       quantity: item.quantity * itemExistedInBill?.unit?.ratio,
      //       //       createdAt: updatedAt,
      //       //       createdBy: `Admin - ${user?.clientName}`,
      //       //     },
      //       //   });
      //       // }
      //     }
      //   }
      // }
    }

    return res.status(200).json({ message: 'Expense updated successfully' });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
