import { otherTypeId } from '@/app/lib/constant';
import { TRANSACTION_STATUS } from '@/app/utils/enum';
import { IInventoryUnit, IVendorItem } from '@/app/utils/type';
import { calculateNextIndexPosAndRows } from '@/pages/api/utils/appearance';
import { getUserInfo } from '@/pages/api/utils/auth';
import { deleteInventoryUnit } from '@/pages/api/utils/inventoryUnit';
import { infoBackground } from '@/theme/color';
import { InventoryUnit, PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IBody {
  date: string;
  amount: number;
  description: string;
  paymentMethodId: number;
  spentBy: string;
  createdAt: string;
  invoice: string;
  subTotal?: number;
  GST?: number;
  PST?: number;
  codBoardId?: number;
  status: TRANSACTION_STATUS;
  items: {
    id: number;
    quantity: number;
    // unitPrice: number;
    vendorId: number;
    unit: IInventoryUnit;
    units: IInventoryUnit[];
    inventoryItemId: number;
  }[];
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const {
      date,
      amount,
      description,
      paymentMethodId,
      spentBy,
      createdAt,
      status,
      subTotal,
      GST,
      PST,
      invoice,
      codBoardId,
      items,
    }: IBody = req.body;

    console.log(items, 'items');

    const existingMethod = await prisma.paymentMethod.findUnique({
      where: {
        id: paymentMethodId,
      },
    });

    if (!existingMethod) {
      return res.status(404).json({ error: 'Payment Method Not Found' });
    }

    const user: any = await getUserInfo(req, res);

    const vendors = items.reduce((acc: any, item: any) => {
      if (!acc.includes(item.vendorId)) {
        acc.push(item.vendorId);
      }
      return acc;
    }, []);

    if (invoice && invoice?.trim() !== '') {
      // Check if vendor has expense on that date
      const isExpenseValid = await checkIsExpenseValid(invoice, date, vendors);

      if (!isExpenseValid.ok) {
        return res.status(409).json({ error: isExpenseValid.error });
      }
    }

    const createdBy = `Admin - ${user?.clientName}`;
    console.log(codBoardId, 'codBoardId');

    const newExpense = await prisma.expense.create({
      data: {
        invoice,
        date: date,
        amount: amount,
        subTotal: subTotal,
        PST: PST,
        GST: GST,
        description: description,
        paymentMethodId: paymentMethodId,
        spentBy: spentBy,
        createdAt: createdAt,
        codBoardId: codBoardId,
        status,
        createdBy,
      },
    });

    // Connect Vendors and Expense
    if (vendors.length > 0) {
      await prisma.vendorExpense.createMany({
        data: vendors.map((vendor: any) => {
          return {
            expenseId: newExpense.id,
            vendorId: vendor,
          };
        }),
      });
    }

    const inventoryItems = await prisma.inventoryItem.findMany({});

    // 3 CASES for each item - Brand new item, New vendor item but inventory exists, Item already exists

    const itemsAlreadyExist = items.filter((item: any) => item.id > 0);
    const itemsToCreate = items.filter((item: any) => item.id === 0);

    const newItems =
      itemsToCreate.length > 0
        ? itemsToCreate.reduce((acc: any, item: any) => {
            if (!acc.brandNewItems) {
              acc.brandNewItems = [];
            }

            if (!acc.itemsAlreadyHasInventoryItem) {
              acc.itemsAlreadyHasInventoryItem = [];
            }

            const existedInventoryItem = inventoryItems.find(
              (inventoryItem: any) => {
                return inventoryItem.name === item.name;
              },
            );

            if (existedInventoryItem) {
              acc.itemsAlreadyHasInventoryItem.push({
                ...item,
                inventoryItemId: existedInventoryItem.id,
              });
            } else {
              acc.brandNewItems.push(item);
            }

            return acc;
          }, {})
        : {};

    // CASE 1: ITEM ALREADY EXISTS
    if (itemsAlreadyExist.length > 0) {
      // STEP 1: Create FIFO
      await createFifo(itemsAlreadyExist, createdAt, createdBy);

      const vendorItems = await prisma.vendorItem.findMany({
        where: {
          id: {
            in: itemsAlreadyExist.map((item: any) => item.id),
          },
        },
        include: {
          unit: true,
        },
      });

      for (const item of itemsAlreadyExist) {
        // STEP 2: Update quantity in vendor items
        const existedItem: any = vendorItems.find(
          (vendorItem) => vendorItem.id === item.id,
        );

        await updateVendorItemQuantity(existedItem, item);

        // STEP 3: Check unit price in Inventory Unit (Update if needed)
        await checkAndUpdateUnits(
          existedItem.unit,
          item.units,
          item.id,
          createdAt,
          createdBy,
        );
      }
      // STEP 4: Create OrderedItems
      // Use item already exist to easy to retrieve unitPrice
      const response = await createOrderedItems(
        itemsAlreadyExist,
        newExpense,
        createdAt,
        createdBy,
      );

      if (!response.ok) {
        return res.status(404).json({
          error: response.error,
        });
      }
    }

    // CASE 2: BRAND NEW ITEMS
    if (
      Object.keys(newItems).length > 0 &&
      newItems?.brandNewItems?.length > 0
    ) {
      const brandNewItems = newItems.brandNewItems;

      // STEP 1: Create Inventory Items
      const { nextPos, newRows } = await calculateNextIndexPosAndRows(
        otherTypeId,
        brandNewItems.length,
      );

      for (let i = 0; i < brandNewItems.length; i++) {
        const newItem = brandNewItems[i];

        await prisma.inventoryItem.create({
          data: {
            name: newItem.name,
            createdAt,
            createdBy,
            color: infoBackground,
            typeId: otherTypeId,
            indexPos: nextPos[i],
          },
        });
      }

      // Update item type rows
      await prisma.itemType.update({
        where: {
          id: otherTypeId,
        },
        data: {
          rows: newRows,
        },
      });



      // await prisma.inventoryItem.createMany({
      //   data: brandNewItems.map((item: any) => {
      //     return {
      //       name: item.name,
      //       createdAt,
      //       createdBy,
      //       color: infoBackground,
      //       typeId: otherTypeId,
      //       indexPos: 1,
      //     };
      //   }),
      // });

      const newInventoryItems = await prisma.inventoryItem.findMany({
        where: {
          createdAt,
          createdBy,
        },
      });

      // STEP 2: Create Vendor Items
      const newVendorItems: any = brandNewItems.map((item: any) => {
        const existedItem = newInventoryItems.find(
          (inventoryItem) => inventoryItem.name === item.name,
        );

        if (!existedItem) {
          return res.status(404).json({
            error: 'Conflict Inventory Item Not Found',
          });
        }

        return {
          inventoryItemId: existedItem.id,
          vendorId: item.vendorId,
          quantity: item.quantity,
          createdAt,
          createdBy,
        };
      });

      await prisma.vendorItem.createMany({
        data: newVendorItems,
      });

      const newVendorItemsCreated = await prisma.vendorItem.findMany({
        where: {
          createdAt,
          createdBy,
        },
        include: {
          inventoryItem: true,
        },
      });

      // STEP 3: Create Inventory Units
      const newUnits = brandNewItems
        .map((item: any) => {
          const existedVendorItem = newVendorItemsCreated.find(
            (vendorItem) => vendorItem.inventoryItem.name === item.name,
          );

          if (!existedVendorItem) {
            return res.status(404).json({
              error: 'Conflict Inventory Item Not Found',
            });
          }

          return item.units.map((unit: IInventoryUnit) => {
            return {
              vendorItemId: existedVendorItem.id,
              unit: unit.unit,
              unitPrice: unit.unitPrice,
              ratio: unit.ratio,
              createdAt,
              createdBy,
            };
          });
        })
        .flat();

      await prisma.inventoryUnit.createMany({
        data: newUnits,
      });

      // STEP 4: Create FIFO

      const newItemsWithVendorItemId = brandNewItems.map((item: any) => {
        const vendorItem = newVendorItemsCreated.find(
          (vItem) => vItem.inventoryItem.name === item.name,
        );

        if (!vendorItem) {
          return res.status(404).json({
            error: 'Conflict Inventory Item Not Found',
          });
        }

        return {
          ...item,
          id: vendorItem.id,
          inventoryItemId: vendorItem.inventoryItemId,
        };
      });
      await createFifo(newItemsWithVendorItemId, createdAt, createdBy);

      // STEP 5: Create OrderedItems
      const response = await createOrderedItems(
        newItemsWithVendorItemId,
        newExpense,
        createdAt,
        createdBy,
      );

      if (!response.ok) {
        return res.status(404).json({
          error: response.error,
        });
      }
    }

    // CASE 3: UPDATE ITEMS ALREADY EXIST WITH INVENTORY ITEM
    if (
      Object.keys(newItems).length > 0 &&
      newItems?.itemsAlreadyHasInventoryItem?.length > 0
    ) {
      const existedItems = newItems.itemsAlreadyHasInventoryItem;

      // STEP 1: Create Vendor Items
      await prisma.vendorItem.createMany({
        data: existedItems.map((item: any) => {
          return {
            inventoryItemId: item?.inventoryItemId,
            vendorId: item.vendorId,
            quantity: item.quantity,
            createdAt,
            createdBy,
          };
        }),
      });

      // STEP 2: Create FIFO
      const newVendorItemsCreated = await prisma.vendorItem.findMany({
        where: {
          createdAt,
          createdBy,
        },
        include: {
          inventoryItem: true,
        },
      });

      const newItemsWithVendorItemId = existedItems.map((item: any) => {
        const vendorItem = newVendorItemsCreated.find(
          (vItem) => vItem.inventoryItem.name === item.name,
        );

        if (!vendorItem) {
          return res.status(404).json({
            error: 'Conflict Inventory Item Not Found',
          });
        }

        return {
          ...item,
          id: vendorItem.id,
          inventoryItemId: vendorItem.inventoryItemId,
        };
      });

      await createFifo(newItemsWithVendorItemId, createdAt, createdBy);

      // STEP 3: Create Inventory Units
      const newUnits = existedItems
        .map((item: any) => {
          const existedVendorItem = newVendorItemsCreated.find(
            (vendorItem) => vendorItem.inventoryItem.name === item.name,
          );

          if (!existedVendorItem) {
            return res.status(404).json({
              error: 'Conflict Inventory Item Not Found',
            });
          }

          return item.units.map((unit: IInventoryUnit) => {
            return {
              vendorItemId: existedVendorItem.id,
              unit: unit.unit,
              unitPrice: unit.unitPrice,
              ratio: unit.ratio,
              createdAt,
              createdBy,
            };
          });
        })
        .flat();

      await prisma.inventoryUnit.createMany({
        data: newUnits,
      });

      // STEP 4: Create OrderedItems
      const response = await createOrderedItems(
        newItemsWithVendorItemId,
        newExpense,
        createdAt,
        createdBy,
      );

      if (!response.ok) {
        return res.status(500).json({
          message: response.error,
        });
      }
    }

    return res.status(200).json({ message: 'Expense created successfully' });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}

export const checkIsExpenseValid = async (
  invoice: string,
  date: string,
  vendors: number[],
) => {
  const prisma = new PrismaClient();

  const existingVendorExpense = await prisma.expense.findMany({
    where: {
      invoice: invoice,
      date: date,
      vendors: {
        some: {
          vendorId: {
            in: vendors,
          },
        },
      },
    },
  });

  if (existingVendorExpense.length > 0) {
    return { ok: false, error: `Expense Already Exists For ${invoice}` };
    // return res
    //   .status(409)
    //   .json({ error: `Expense Already Exists For ${invoice}` });
  }

  return { ok: true };
};

export const checkAndUpdateUnits = async (
  dbUnits: InventoryUnit[],
  newUnits: IInventoryUnit[],
  vendorItemId: number,
  createdAt: string,
  createdBy: string,
) => {
  if (newUnits.length === 0) {
    return;
  }
  const prisma = new PrismaClient();

  const sortedDBUnits = dbUnits.sort((a, b) => a?.ratio - b?.ratio);
  const sortedNewUnits = newUnits.sort((a, b) => a?.ratio - b?.ratio);

  console.log({ sortedDBUnits, sortedNewUnits });

  let dbIndex = 0;
  let newIndex = 0;

  while (dbIndex < sortedDBUnits.length && newIndex < sortedNewUnits.length) {
    if (sortedDBUnits[dbIndex]?.ratio === sortedNewUnits[newIndex]?.ratio) {
      // Check for both unit and unit price
      const updatedField: any = {};

      if (sortedDBUnits[dbIndex].unit !== sortedNewUnits[newIndex].unit) {
        updatedField.unit = sortedNewUnits[newIndex].unit;
      }

      if (
        sortedDBUnits[dbIndex].unitPrice !== sortedNewUnits[newIndex].unitPrice
      ) {
        updatedField.unitPrice = sortedNewUnits[newIndex].unitPrice;
      }

      if (Object.keys(updatedField).length > 0) {
        await prisma.inventoryUnit.update({
          where: {
            id: sortedDBUnits[dbIndex]?.id,
          },
          data: updatedField,
        });
      }

      dbIndex++;
      newIndex++;
    } else {
      // CASE 1: dbUnit.ratio < newUnit.ratio
      if (sortedDBUnits[dbIndex]?.ratio < sortedNewUnits[newIndex]?.ratio) {
        await deleteInventoryUnit([sortedDBUnits[dbIndex]?.id], vendorItemId);
        // await prisma.inventoryUnit.delete({
        //   where: {
        //     id: sortedDBUnits[dbIndex]?.id,
        //   },
        // });
        dbIndex++;
      }

      // CASE 2: newUnit.ratio < dbUnit.ratio
      if (sortedNewUnits[newIndex]?.ratio < sortedDBUnits[dbIndex]?.ratio) {
        await prisma.inventoryUnit.create({
          data: {
            vendorItemId,
            unit: sortedNewUnits[newIndex].unit,
            unitPrice: sortedNewUnits[newIndex].unitPrice,
            ratio: sortedNewUnits[newIndex]?.ratio,
            createdAt,
            createdBy,
          },
        });
        newIndex++;
      }
    }
  }

  const deletedIds = [];
  while (dbIndex < sortedDBUnits.length) {
    deletedIds.push(sortedDBUnits[dbIndex]?.id);
    dbIndex++;
  }

  await deleteInventoryUnit(deletedIds, vendorItemId);
  // const vendorItem = await prisma.vendorItem.findUnique({
  //   where: {
  //     id: vendorItemId,
  //   },
  // })
  // const inventoryUnits = await prisma.inventoryUnit.findMany({
  //   where: {
  //     id: {
  //       notIn: deletedIds,
  //     },
  //     vendorItem: {
  //       inventoryItemId: vendorItem?.inventoryItemId
  //     },
  //   },
  // });

  // await prisma.orderedItems.updateMany({
  //   where: {
  //     inventoryUnitId: {
  //       in: deletedIds,
  //     }
  //   },
  //   data: {
  //     inventoryUnitId: inventoryUnits[0]?.id
  //   }
  // })

  // await prisma.item.updateMany({
  //   where: {
  //     inventoryUnitId: {
  //       in: deletedIds,
  //     }
  //   },
  //   data: {
  //     inventoryUnitId: inventoryUnits[0]?.id
  //   }
  // })

  // await prisma.inventoryUnit.deleteMany({
  //   where: {
  //     id: {
  //       in: deletedIds,
  //     }
  //   },
  // });

  console.log(newIndex, sortedNewUnits.length);
  while (newIndex < sortedNewUnits.length) {
    await prisma.inventoryUnit.create({
      data: {
        vendorItemId,
        unit: sortedNewUnits[newIndex].unit,
        unitPrice: sortedNewUnits[newIndex].unitPrice,
        ratio: sortedNewUnits[newIndex]?.ratio,
        createdAt,
        createdBy,
      },
    });
    newIndex++;
  }
};

export const createFifo = async (
  vendorItemList: any,
  createdAt: string,
  createdBy: string,
) => {
  const prisma = new PrismaClient();

  const allNegativeFifo = await prisma.fifo.findMany({
    where: {
      quantity: {
        lt: 0,
      },
    },
  });

  const deletedFifoIds = [];
  const itemHasAlreadyUpdateIds: number[] = [];
  if (allNegativeFifo.length > 0) {
    for (const item of vendorItemList) {
      const negativeFifo = allNegativeFifo.find(
        (fifo: any) => fifo.vendorItemId === item.id,
      );

      if (!negativeFifo) {
        continue;
      }

      console.log({ unit: item.unit });
      const itemQuantity = item.quantity * item?.unit?.ratio;
      // itemQuantity > negativeFifo.quantity
      // Delete targeted fifo and create new fifo
      deletedFifoIds.push(negativeFifo.id);
      const newFifo = await prisma.fifo.create({
        data: {
          quantity: itemQuantity + negativeFifo.quantity, // subtract to negative mean subtract
          inventoryItemId: item.inventoryItemId,
          vendorItemId: item.id,
          price: item.unit?.unitPrice / item?.unit?.ratio,
          createdAt,
          createdBy,
        },
      });

      // Update all ordered items has targeted fifo id
      await prisma.orderedItems.updateMany({
        where: {
          fifoId: negativeFifo.id,
        },
        data: {
          fifoId: newFifo.id,
        },
      });

      itemHasAlreadyUpdateIds.push(item.id);
    }

    await prisma.fifo.deleteMany({
      where: {
        id: {
          in: deletedFifoIds,
        },
      },
    });
  }

  const fifoItems = vendorItemList
    .filter((vItem: any) => !itemHasAlreadyUpdateIds.includes(vItem.id))
    .map((item: any) => {
      return {
        inventoryItemId: item.inventoryItemId,
        vendorItemId: item.id,
        quantity: item.quantity * item?.unit?.ratio,
        price: item.unit?.unitPrice / item?.unit?.ratio,
        createdAt,
        createdBy,
      };
    });

  await prisma.fifo.createMany({
    data: fifoItems,
  });
};

export const updateVendorItemQuantity = async (
  existedItem: IVendorItem,
  vendorItem: any,
) => {
  const prisma = new PrismaClient();

  await prisma.vendorItem.update({
    where: {
      id: vendorItem.id,
    },
    data: {
      quantity: existedItem.quantity + vendorItem.quantity,
    },
  });
};

export const createOrderedItems = async (
  vendorItemList: any,
  newExpense: any,
  createdAt: string,
  createdBy: string,
) => {
  const prisma = new PrismaClient();

  const inventoryUnits = await prisma.inventoryUnit.findMany({
    where: {
      vendorItemId: {
        in: vendorItemList.map((item: any) => item.id),
      },
    },
  });

  const newFifoItems = await prisma.fifo.findMany({
    where: {
      vendorItemId: {
        in: vendorItemList.map((item: any) => item.id),
      },
      createdAt,
      createdBy,
    },
    include: {
      inventoryItem: true,
    },
  });

  const orderedItems: any = vendorItemList.map((item: any) => {
    const fifoItem = newFifoItems.find((fItem: any) => {
      return fItem.vendorItemId === item.id;
    });

    if (!fifoItem) {
      return { ok: false, error: 'Conflict in FIFO Items' };
    }

    let selectedUnit = item.unit;

    if (!selectedUnit) {
      return { ok: false, error: 'Conflict in Selected Unit' };
    }

    if (selectedUnit.id < 1) {
      selectedUnit = inventoryUnits.find((unit: any) => {
        return (
          unit.vendorItemId === item.id && unit.ratio === selectedUnit.ratio
        );
      });
    }

    return {
      fifoId: fifoItem.id,
      quantity: item.quantity,
      expenseId: newExpense.id,
      price: item.unit.unitPrice,
      name: fifoItem.inventoryItem.name,
      inventoryUnitId: selectedUnit?.id,
    };
  });

  await prisma.orderedItems.createMany({
    data: orderedItems,
  });

  return { ok: true, error: null, orderedItems };
};

//[
//   {
//     id: 0,
//     vendorId: 4,
//     quantity: 1,
//     unitPrice: 0,
//     unit: { id: 0, unit: 'bags', unitPrice: 10, ratio: 1, vendorItemId: -1 },
//     units: [ [Object] ],
//     name: 'Test Item 1'
//   }
// ] brand new items
