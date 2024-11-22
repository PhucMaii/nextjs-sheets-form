import { TRANSACTION_STATUS } from '@/app/utils/enum';
import { IInventoryUnit, IVendorItem } from '@/app/utils/type';
import { getUserInfo } from '@/pages/api/utils/auth';
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
  codBoardId?: number;
  status: TRANSACTION_STATUS;
  items: {
    id: number;
    quantity: number;
    unitPrice: number;
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
      invoice,
      codBoardId,
      items,
    }: IBody = req.body;

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

    const newExpense = await prisma.expense.create({
      data: {
        invoice,
        date: date,
        amount: amount,
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

    // 3 CASES for each item
    
    const itemsAlreadyExist = items.filter((item: any) => item.id > 0);
    const itemsToCreate = items.filter((item: any) => item.id === 0);

    const newItems = itemsToCreate.length > 0 ? itemsToCreate.reduce((acc: any, item: any) => {
        if (!acc.brandNewItems) {
          acc.brandNewItems = [];
        }

        if (!acc.itemsAlreadyHasInventoryItem) {
          acc.itemsAlreadyHasInventoryItem = [];
        }

        const existedInventoryItem = inventoryItems.find((inventoryItem: any) => {
          return inventoryItem.name === item.name;
        });

        if (existedInventoryItem) {
          acc.itemsAlreadyHasInventoryItem.push({...item, inventoryItemId: existedInventoryItem.id});
        } else {
          acc.brandNewItems.push(item);
        }

        return acc;
    }, {}): {};

    // CASE 1: ITEM ALREADY EXISTS
    if (itemsAlreadyExist.length > 0) {
      // STEP 1: Create FIFO
      // const fifoItems = itemsAlreadyExist.map((item: any) => {
      //   const selectedUnit = item.unit.find((unit: any) => {
      //     return unit.isSelected;
      //   });

      //   return {
      //     inventoryItemId: item.inventoryItemId,
      //     vendorItemId: item.id,
      //     quantity: item.quantity * selectedUnit.ratio,
      //     createdAt,
      //     createdBy,
      //   };
      // })

      // await prisma.fifo.createMany({
      //   data: fifoItems,
      // });
      await createFifo(itemsAlreadyExist, createdAt, createdBy);

      const vendorItems = await prisma.vendorItem.findMany({
        where: {
          id: {
            in: itemsAlreadyExist.map((item: any) => item.id),
          }
        },
        include: {
          unit: true
        }
      });

      for (const item of itemsAlreadyExist) {
        // STEP 2: Update quantity in vendor items
        const existedItem: any = vendorItems.find(
          (vendorItem) => vendorItem.id === item.id,
        );

        // if (!existedItem) continue;
        
        // await prisma.vendorItem.update({
        //   where: {
        //     id: item.id,
        //   },
        //   data: {
        //     quantity: existedItem.quantity + item.quantity,
        //   },
        // });
        await updateVendorItemQuantity(existedItem, item);

        // STEP 3: Check unit price in Inventory Unit (Update if needed)
        await checkAndUpdateUnits(existedItem.unit, item.units, item.id, createdAt, createdBy);
      }
      // STEP 4: Create OrderedItems
      // Use item already exist to easy to retrieve unitPrice
      const response = await createOrderedItems(itemsAlreadyExist, newExpense, createdAt, createdBy);

      if (!response.ok) {
        return res.status(404).json({
          error: response.error,
        });
      }
      // const inventoryUnits = await prisma.inventoryUnit.findMany({
      //   where: {
      //     vendorItemId: {
      //       in: itemsAlreadyExist.map((item: any) => item.id),
      //     }
      //   }
      // });

      // const newFifoItems = await prisma.fifo.findMany({
      //   where: {
      //     vendorItemId: {
      //       in: itemsAlreadyExist.map((item: any) => item.id),
      //     },
      //     createdAt,
      //     createdBy,
      //   },
      //   include: {
      //     inventoryItem: true,
      //   }
      // });
      // const orderedItems: any = itemsAlreadyExist.map((item: any) => {
      //   const fifoItem = newFifoItems.find((fItem: any) => {
      //     return fItem.vendorItemId === item.id;
      //   });

      //   if (!fifoItem) {
      //     return res.status(404).json({
      //       error: 'Conflict in FIFO Items',
      //     })
      //   }

      //   let selectedUnit = item.unit.find((unit: any) => {
      //     return unit.isSelected;
      //   });

      //   if (!selectedUnit) {
      //     return res.status(404).json({
      //       error: 'Conflict in Selected Unit',
      //     })
      //   }

      //   if (selectedUnit.id < 1) {
      //     selectedUnit = inventoryUnits.find((unit: any) => {
      //       return unit.vendorItemId === item.id && unit.ratio === selectedUnit.ratio;          
      //     });
      //   }

      //   return {
      //     fifoId: fifoItem.id,
      //     quantity: item.quantity,
      //     expenseId: newExpense.id,
      //     price: item.unit.unitPrice,
      //     name: fifoItem.inventoryItem.name,
      //     invenotryUnitId: selectedUnit?.id,
      //   };
      // });

      // await prisma.orderedItems.createMany({
      //   data: orderedItems,
      // });

    }

    // CASE 2: BRAND NEW ITEMS
    if (Object.keys(newItems).length > 0 && newItems?.brandNewItems?.length > 0) {
      const brandNewItems = newItems.brandNewItems;

      // STEP 1: Create Inventory Items
      await prisma.inventoryItem.createMany({
        data: brandNewItems.map((item: any) => {
          return {
            name: item.name,
            createdAt,
            createdBy,
          };
        }),
      });

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
        )
        
        if (!existedItem) {
          return res.status(404).json({
            error: 'Conflict Inventory Item Not Found',
          })
        }

        return {
          inventoryItemId: existedItem.id,
          vendorId: item.vendorId,
          quantity: item.quantity,
          createdAt,
          createdBy,
        }
      })

      await prisma.vendorItem.createMany({
        data: newVendorItems,
      });

      const newVendorItemsCreated = await prisma.vendorItem.findMany({
        where: {
          createdAt,
          createdBy,
        },
        include: {
          inventoryItem: true
        }
      });

      // STEP 3: Create FIFO
      // const fifoItems: any = newVendorItemsCreated.map((vendorItem: any) => {
      //   return {
      //     inventoryItemId: vendorItem.inventoryItemId,
      //     vendorItemId: vendorItem.id,
      //     quantity: vendorItem.quantity,
      //     createdAt,
      //     createdBy,
      //   };
      // });

      // await prisma.fifo.createMany({
      //   data: fifoItems,
      // });
      await createFifo(newVendorItemsCreated, createdAt, createdBy);
      
      // STEP 4: Create Inventory Units
      const newUnits = brandNewItems.map((item: any) => {
        const existedVendorItem = newVendorItemsCreated.find(
          (vendorItem) => vendorItem.inventoryItem.name === item.name,
        );

        if (!existedVendorItem) {
          return res.status(404).json({
            error: 'Conflict Inventory Item Not Found',
          })
        }

        return item.units.map((unit: IInventoryUnit) => {
          return {
            inventoryItemId: existedVendorItem.inventoryItemId,
            unit: unit.unit,
            unitPrice: unit.unitPrice,
            ratio: unit.ratio,
            createdAt,
            createdBy,
          }
        })
      }).flat();

      await prisma.inventoryUnit.createMany({
        data: newUnits,
      });

      // STEP 5: Create OrderedItems
      // const orderedItems: any = brandNewItems.map((item: any) => {
      //   const fifoItem = fifoItems.find((fItem: any) => {
      //     return fItem.vendorItemId === item.id;
      //   });

      //   if (!fifoItem) {
      //     return res.status(404).json({
      //       error: 'Conflict in FIFO Items',
      //     })
      //   }

      //   return {
      //     fifoId: fifoItem.id,
      //     quantity: item.quantity,
      //     expenseId: newExpense.id,
      //     price: item.unit.unitPrice,
      //     name: fifoItem.inventoryItem.name,
      //   }
      // });

      // await prisma.orderedItems.createMany({
      //   data: orderedItems,
      // });

      await createOrderedItems(brandNewItems, newExpense, createdAt, createdBy);
    }

    // CASE 3: UPDATE ITEMS ALREADY EXIST WITH INVENTORY ITEM
    if (Object.keys(newItems).length > 0 && newItems?.itemsAlreadyHasInventoryItem?.length > 0) {
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

      // const vendorItems = await prisma.vendorItem.findMany({
      //   where: {
      //     createdAt,
      //     createdBy,
      //   },
      //   include: {
      //     inventoryItem: true,
      //   }
      // });

      // STEP 2: Create FIFO
      // const fifoItems: any = vendorItems.map((vendorItem: any) => {
      //   return {
      //     inventoryItemId: vendorItem.inventoryItemId,
      //     vendorItemId: vendorItem.id,
      //     quantity: vendorItem.quantity,
      //     createdAt,
      //     createdBy,
      //   };
      // });

      // await prisma.fifo.createMany({
      //   data: fifoItems,
      // });

      // const newFifoItems = await prisma.fifo.findMany({
      //   where: {
      //     createdAt,
      //     createdBy,
      //   },
      //   include: {
      //     inventoryItem: true,
      //   }
      // })

      await createFifo(existedItems, createdAt, createdBy);

      // STEP 3: Create Inventory Units
      const newUnits = existedItems.map((item: any) => {
        return item.units.map((unit: IInventoryUnit) => {
          return {
            inventoryItemId: item.inventoryItemId,
            unit: unit.unit,
            unitPrice: unit.unitPrice,
            ratio: unit.ratio,
            createdAt,
            createdBy,
          }
        })
      }).flat();

      await prisma.inventoryUnit.createMany({
        data: newUnits,
      });

      // STEP 4: Create OrderedItems
      // const orderedItems: any = existedItems.map((item: any) => {
      //   const fifoItem = newFifoItems.find((fItem: any) => {
      //     return fItem.vendorItemId === item.id;
      //   });

      //   if (!fifoItem) {
      //     return res.status(404).json({
      //       error: 'Conflict in FIFO Items',
      //     })
      //   }

      //   return {
      //     fifoId: fifoItem.id,
      //     quantity: item.quantity,
      //     expenseId: newExpense.id,
      //     price: item.unit.unitPrice,
      //     name: fifoItem.inventoryItem.name,
      //   }
      // });

      // await prisma.orderedItems.createMany({
      //   data: orderedItems,
      // });

      await createOrderedItems(existedItems, newExpense, createdAt, createdBy);
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

export const checkAndUpdateUnits = async (dbUnits: InventoryUnit[], newUnits: IInventoryUnit[], vendorItemId: number, createdAt: string, createdBy: string) => {
  const prisma = new PrismaClient();

  const sortedDBUnits = dbUnits.sort((a, b) => a.ratio - b.ratio);
  const sortedNewUnits = newUnits.sort((a, b) => a.ratio - b.ratio);

  let dbIndex = 0;
  let newIndex = 0;

  while (dbIndex < sortedDBUnits.length && newIndex < sortedNewUnits.length) {
    if (sortedDBUnits[dbIndex].ratio === sortedNewUnits[newIndex].ratio) {
      // Check for both unit and unit price
      const updatedField: any = {};

      if (sortedDBUnits[dbIndex].unit !== sortedNewUnits[newIndex].unit) {
        updatedField.unit = sortedNewUnits[newIndex].unit;
      }

      if (sortedDBUnits[dbIndex].unitPrice !== sortedNewUnits[newIndex].unitPrice) {
        updatedField.unitPrice = sortedNewUnits[newIndex].unitPrice;
      }

      if (Object.keys(updatedField).length > 0) {
        await prisma.inventoryUnit.update({
          where: {
            id: sortedDBUnits[dbIndex].id,
          },
          data: updatedField,
        });  
      }

      dbIndex++;
      newIndex++;
    } else {
      // CASE 1: dbUnit.ratio < newUnit.ratio
      if (sortedDBUnits[dbIndex].ratio < sortedNewUnits[newIndex].ratio) {
        await prisma.inventoryUnit.delete({
          where: {
            id: sortedDBUnits[dbIndex].id,
          },
        });
        dbIndex++;
      }

      // CASE 2: newUnit.ratio < dbUnit.ratio
      if (sortedDBUnits[newIndex].ratio < sortedNewUnits[dbIndex].ratio) {
        await prisma.inventoryUnit.create({
          data: {
            vendorItemId,
            unit: sortedNewUnits[newIndex].unit,
            unitPrice: sortedNewUnits[newIndex].unitPrice,
            ratio: sortedNewUnits[newIndex].ratio,
            createdAt,
            createdBy
          },
        });
        newIndex++;
      }
    }
  }

  while (dbIndex < sortedDBUnits.length) {
    await prisma.inventoryUnit.delete({
      where: {
        id: sortedDBUnits[dbIndex].id,
      },
    });
    dbIndex++;
  }

  while (newIndex < sortedNewUnits.length) {
    await prisma.inventoryUnit.create({
      data: {
        vendorItemId,
        unit: sortedNewUnits[newIndex].unit,
        unitPrice: sortedNewUnits[newIndex].unitPrice,
        ratio: sortedNewUnits[newIndex].ratio,
        createdAt,
        createdBy
      },
    });
    newIndex++;
  }
}

export const createFifo = async (vendorItemList: any, createdAt: string, createdBy: string) => {
  const prisma = new PrismaClient();

  const fifoItems = vendorItemList.map((item: any) => {

    return {
      inventoryItemId: item.inventoryItemId,
      vendorItemId: item.id,
      quantity: item.quantity * item.unit.ratio,
      createdAt,
      createdBy,
    };
  })

  await prisma.fifo.createMany({
    data: fifoItems,
  });
}

export const updateVendorItemQuantity = async (existedItem: IVendorItem, vendorItem: any) => {
  const prisma = new PrismaClient();
  
  await prisma.vendorItem.update({
    where: {
      id: vendorItem.id,
    },
    data: {
      quantity: existedItem.quantity + vendorItem.quantity,
    },
  });
}

export const createOrderedItems = async (vendorItemList: any, newExpense: any, createdAt: string, createdBy: string) => {
  const prisma = new PrismaClient();

  const inventoryUnits = await prisma.inventoryUnit.findMany({
    where: {
      vendorItemId: {
        in: vendorItemList.map((item: any) => item.id),
      }
    }
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
    }
  });

  const orderedItems: any = vendorItemList.map((item: any) => {
    const fifoItem = newFifoItems.find((fItem: any) => {
      return fItem.vendorItemId === item.id;
    });

    if (!fifoItem) {
      return {ok: false, error: "Conflict in FIFO Items"}
    }

    let selectedUnit = item.unit;

    if (!selectedUnit) {
      return {ok: false, error: 'Conflict in Selected Unit'}
    }

    if (selectedUnit.id < 1) {
      selectedUnit = inventoryUnits.find((unit: any) => {
        return unit.vendorItemId === item.id && unit.ratio === selectedUnit.ratio;          
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

  return { ok: true, error: null }
}