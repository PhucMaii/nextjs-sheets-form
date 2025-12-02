import {
  Fifo,
  InventoryLogFrom,
  InventoryLogType,
  OrderedItems,
  PaymentStatus,
  PrismaClient,
} from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { checkAndUpdateUnits, createFifo } from './POST';
import { IInventoryUnit } from '@/app/utils/type';
import { subtractInventoryItem } from '../../orderedItems/single';
import { getTodayDate } from '@/pages/api/utils/date';
import { getCreatedBy } from '@/pages/api/import-sheets/utils';
import { USER_ROLE } from '@/app/utils/enum';
import { updateCheque } from '../../expenses/PUT';
import { recordTransactionInventoryLog } from '@/pages/api/utils/logs';

interface IPurchasedItem {
  id: number; // ordered items id
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
  updatedItems: IPurchasedItem[] | any;
  discount?: number;
  codBoardId?: number;
  status?: PaymentStatus;
  frontFileKey?: string;
  frontFileType?: string;
  backFileKey?: string;
  backFileType?: string;
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
      discount,
      codBoardId,
      status,
      frontFileKey,
      frontFileType,
      backFileKey,
      backFileType,
    }: IBody = req.body;

    const updatedAt = getTodayDate().dateAndTime;

    const existingExpense = await prisma.expense.findUnique({
      where: {
        id: id,
      },
      include: {
        orderedItems: {
          include: {
            inventoryItem: true,
            fifo: {
              include: {
                inventoryItem: true,
              },
            },
            inventoryUnit: true,
          },
        },
        medias: true,
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
        codBoardId: codBoardId,
        status: status,
      },
      include: {
        orderedItems: {
          include: {
            fifo: {
              include: {
                inventoryItem: true,
              },
            },
          },
        },
        medias: true,
      },
    });

    const createdBy = await getCreatedBy(req, res, USER_ROLE.ADMIN);
    await updateCheque(
      existingExpense,
      frontFileKey,
      frontFileType,
      backFileKey,
      backFileType,
      createdBy,
    );

    const oldItemIds = oldItems.map((item: any) => {
      return item.id;
    });

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

    // If there is any changes in ordered items
    if (isOrderedItemsChange) {
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

        // Conflict - vendor item not found, must be removed from the bill
        if (!vendorItem) {
          console.error(
            'Conflict - vendor item not found, must be removed from the bill',
          );
          await prisma.orderedItems.delete({
            where: {
              id: item.id,
            },
          });

          // subtract quantity
          if (item.fifo && item.inventoryUnit) {
            await subtractInventoryItem(
              -1,
              item.fifo,
              item.inventoryUnit,
              item.quantity,
            );

            // Record inventory log
            await recordTransactionInventoryLog(
              Number(id),
              item.fifo.inventoryItemId,
              item.fifo.quantity,
              InventoryLogType.SUBTRACT,
              InventoryLogFrom.EDIT_TRANSACTION,
              `Subtract ${item.fifo.quantity} ${item.fifo.inventoryItem.name} from inventory due to edit item quantity in expense ${id} update`,
            );
          }
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
          (oldItem: OrderedItems) => oldItem.id === item.id,
        );

        // If item is new, add to newAddedItems
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

          const difference = item.quantity - existedItem.quantity;
          const isRestock = difference > 0;

          const newFifoQuantity =
            existedFifo.quantity + difference;

          await prisma.orderedItems.update({
            where: {
              id: existedItem.id,
            },
            data: {
              quantity: item.quantity,
            },
          });

          if (existedItem?.fifoId) {
            await prisma.fifo.update({
              where: {
                id: existedItem.fifoId,
              },
              data: {
                quantity: newFifoQuantity,
                price: item.unitPrice,
              },
            });

            // Record inventory log
            await recordTransactionInventoryLog(
              Number(id),
              existedItem.inventoryItemId || 0,
              Math.abs(difference),
              isRestock ? InventoryLogType.RESTOCK : InventoryLogType.SUBTRACT,
              InventoryLogFrom.EDIT_TRANSACTION,
              `${isRestock ? 'Restock' : 'Subtract'} ${Math.abs(difference)} ${existedItem?.inventoryItem?.name || ''} to inventory due to edit item quantity in expense ${id} update`,
            );
          }

          // await prisma.vendorItem.update({
          //   where: {
          //     id: item.vendorItemId,
          //   },
          //   data: {
          //     quantity:
          //       vendorItem.quantity - existedFifo.quantity + newFifoQuantity,
          //   },
          // });
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
          inventoryItemId: newItem.inventoryItem.id,
        }));

        await createFifo(
          Number(companyId),
          vendorItemList,
          updatedAt,
          createdBy,
          Number(id),
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
              inventoryItemId: newItem.inventoryItem.id,
            };
          }

          return {
            expenseId: existingExpense.id,
            name: newItem.name,
            price: newItem.unitPrice,
            quantity: newItem.quantity,
            fifoId: selectedFifo.id,
            inventoryUnitId: newItem.unit.id,
            inventoryItemId: newItem.inventoryItem.id,
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

        // subtract quantity
        for (const removedItem of removedItems) {
          if (removedItem.fifo && removedItem.inventoryUnit) {
            await subtractInventoryItem(
              -1,
              removedItem.fifo,
              removedItem.inventoryUnit,
              removedItem.quantity,
            );

            // Record inventory log
            await recordTransactionInventoryLog(
              Number(id),
              removedItem.fifo.inventoryItemId,
              removedItem.quantity,
              InventoryLogType.SUBTRACT,
              InventoryLogFrom.DELETE_TRANSACTION,
              `Subtract ${removedItem.quantity} ${removedItem.fifo.inventoryItem.name} from inventory due to remove item in expense ${id} update`,
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
