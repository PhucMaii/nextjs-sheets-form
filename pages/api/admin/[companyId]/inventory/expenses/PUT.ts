import { Fifo, OrderedItems, PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { checkAndUpdateUnits, createFifo } from './POST';
import { IInventoryUnit } from '@/app/utils/type';
import { subtractInventoryItem } from '../../orderedItems/single';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

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
  PST?: number;
  GST?: number;
  subTotal?: number;
  // oldItemIds: number[]; // Ordered items ids
  oldItems: IPurchasedItem[];
  updatedItems: IPurchasedItem[];
  updatedAt: string;
  discount?: number;
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({
        error: 'Company ID is required',
      });
    }

    const {
      id,
      amount,
      invoice,
      description,
      date,
      paymentMethodId,
      PST,
      GST,
      subTotal,
      spentBy,
      oldItems,
      updatedItems,
      updatedAt,
      discount,
    }: IBody = req.body;

    const existingExpense = await prisma.expense.findUnique({
      where: {
        id: id,
      },
      include: {
        orderedItems: {
          include: {
            fifo: true,
            inventoryUnit: true,
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
          companyId: Number(companyId),
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
        PST: PST,
        GST: GST,
        subTotal: subTotal,
        description: description,
        date: date,
        invoice,
        paymentMethodId: paymentMethodId,
        spentBy: spentBy,
        discount: discount,
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

    console.log({ oldItemIds, updatedItems });

    // Check is there any changes in ordered items
    let isOrderedItemsChange = false;

    if (oldItemIds.length !== updatedItems.length) {
      isOrderedItemsChange = true;
    } else {
      for (const item of existingExpense.orderedItems) {
        const updatedItem = updatedItems.find(
          (newItem: any) => newItem.name === item.name,
        );

        if (!updatedItem) {
          isOrderedItemsChange = true;
          break;
        }

        if (
          updatedItem.quantity !== item.quantity ||
          updatedItem.unitPrice !== item.price
        ) {
          isOrderedItemsChange = true;
          break;
        }
      }
    }

    if (isOrderedItemsChange) {
      const session: any = await getServerSession(req, res, authOptions);
      const user: any = session?.user;
      const createdBy = `Admin - ${user?.name}`;

      const vendorItems = await prisma.vendorItem.findMany({
        where: {
          companyId: Number(companyId),
        },
        include: {
          unit: true,
        },
      });

      const allFifos = await prisma.fifo.findMany({
        where: {
          companyId: Number(companyId),
        },
      });
      const newAddedItems = [];
      // Update inventory units
      for (const item of updatedItems) {
        const vendorItem = vendorItems.find((vendorItem: any) => {
          return vendorItem.id === item?.vendorItemId;
        });

        if (!vendorItem) {
          continue;
        }

        await checkAndUpdateUnits(
          Number(companyId),
          vendorItem.unit,
          item?.units || [],
          vendorItem.id,
          updatedAt,
          createdBy,
        );

        // Check if item already existed in bill
        const existedItem = existingExpense.orderedItems.find(
          (oldItem: OrderedItems) => oldItem.name === item.name,
        );
        if (!existedItem) {
          newAddedItems.push({ ...item, vendorItem });
          continue;
        }

        // If quantity is different
        if (existedItem.quantity !== item.quantity) {
          const existedFifo = allFifos.find(
            (fifo: any) => fifo.id === existedItem?.fifoId,
          );

          if (!existedFifo) {
            continue;
          }

          console.log({ existedFifo, existedItem, item });
          const newFifoQuantity =
            existedFifo.quantity - existedItem.quantity + item.quantity;

          await prisma.orderedItems.update({
            where: {
              id: existedItem.id,
            },
            data: {
              quantity: item.quantity,
            },
          });

          await prisma.fifo.update({
            where: {
              id: existedItem?.fifoId || 72,
            },
            data: {
              quantity: newFifoQuantity,
              price: item.unitPrice,
            },
          });

          await prisma.vendorItem.update({
            where: {
              id: item.vendorItemId,
            },
            data: {
              quantity:
                vendorItem.quantity - existedFifo.quantity + newFifoQuantity,
            },
          });
        }

        // If price is different - only change in ordered items because checkAndUpdateUnits already update the unit price
        if (existedItem.price !== item.unitPrice) {
          await prisma.orderedItems.update({
            where: {
              id: existedItem.id,
            },
            data: {
              price: item.unitPrice,
            },
          });
        }
      }

      // Create new ordered items if there is any
      if (newAddedItems.length > 0) {
        const vendorItemList = newAddedItems.map((newItem: any) => ({
          ...newItem.vendorItem,
          unit: newItem.unit,
        }));
        console.log(vendorItemList, 'vendorItemList');

        await createFifo(
          Number(companyId),
          vendorItemList,
          updatedAt,
          createdBy,
        );

        // Get just created fifos
        const newFifos = await prisma.fifo.findMany({
          where: {
            companyId: Number(companyId),
            createdAt: updatedAt,
            createdBy,
          },
        });

        const newOrderedItems = newAddedItems.map((newItem: any) => {
          const selectedFifo = newFifos.find(
            (fifo: Fifo) => fifo.vendorItemId === newItem.vendorItemId,
          );

          if (!selectedFifo) {
            console.error(
              'Conflict could not find fifo match with new added items',
            );
            return {
              expenseId: existingExpense.id,
              name: newItem.name,
              price: newItem.unitPrice,
              quantity: newItem.quantity,
              inventoryUnitId: newItem.unit.id,
              inventoryItemId: newItem.inventoryItemId,
            };
          }

          return {
            expenseId: existingExpense.id,
            name: newItem.name,
            price: newItem.unitPrice,
            quantity: newItem.quantity,
            fifoId: selectedFifo.id,
            inventoryUnitId: newItem.unit.id,
            inventoryItemId: newItem.inventoryItemId,
            companyId: Number(companyId),
          };
        });

        await prisma.orderedItems.createMany({
          data: newOrderedItems,
        });
      }

      // Check if there are any removed items
      const updatedItemNames = updatedItems.map((newItem: any) => newItem.name);
      const removedItems = existingExpense.orderedItems.filter(
        (oldItem: OrderedItems) => {
          return !updatedItemNames.includes(oldItem.name);
        },
      );

      if (removedItems.length > 0) {
        const removedItemIds = removedItems.map(
          (item: OrderedItems) => item.id,
        );
        // removed items
        await prisma.orderedItems.deleteMany({
          where: {
            id: {
              in: removedItemIds,
            },
          },
        });

        // Restock quantity
        for (const removedItem of removedItems) {
          if (removedItem.fifo && removedItem.inventoryUnit) {
            await subtractInventoryItem(
              -1,
              removedItem.fifo,
              removedItem.inventoryUnit,
              removedItem.quantity,
            );
          }
        }
      }
    }

    return res.status(200).json({ message: 'Expense updated successfully' });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
