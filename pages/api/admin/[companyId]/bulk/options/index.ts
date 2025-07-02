import { getTodayDate } from '@/pages/api/utils/date';
import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getCreatedBy } from '@/pages/api/import-sheets/utils';

interface IProps {
  inventoryItemId: number;
  categoryIds: number[];
  updatedOptions: any;
}

const prisma = new PrismaClient();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'PUT') {
      return res.status(404).json({ error: 'Your method is not supported' });
    }

    const { inventoryItemId, categoryIds, updatedOptions }: IProps = req.body;

    if (!categoryIds) {
      return res.status(400).json({ error: 'Category Ids are required' });
    }

    const items = await prisma.item.findMany({
      where: {
        inventoryItemId,
        categoryId: {
          in: categoryIds,
        },
      },
      include: {
        options: true,
      },
    });
    // console.log(items, 'items');

    // Cached all old options
    const optionRelated = await prisma.option.findMany({
      where: {
        itemId: {
          in: items.map((item: any) => item.id),
        },
      },
    });
    const toDeleteOptionIds = optionRelated.map((option: any) => option.id);

    // Create new options
    const today = getTodayDate();
    const createdBy: any = await getCreatedBy(req, res);

    const updatedOptionPromises = items.flatMap((item: any) => {
      return prisma.option.createMany({
        data: updatedOptions.map((updatedOption: any) => {
          return {
            name: updatedOption.name,
            price: updatedOption.price,
            availability: true,
            unitId: Number(updatedOption.unitId),
            createdAt: today.dateAndTime,
            createdBy,
            prevPrice: updatedOption?.prevPrice,
            isShowDiscount: updatedOption.isShowDiscount,
            inventoryItemId: item.inventoryItemId,
            itemId: item.id,
          };
        }),
      });
    });

    await Promise.all(updatedOptionPromises);

    // Delete cached options
    await prisma.option.deleteMany({
      where: {
        id: {
          in: toDeleteOptionIds
        }
      }
    })

    // Categorize options
    // const baseOptions = await prisma.option.findMany({
    //   where: {
    //     item: {
    //       categoryId: categoryIds[0],
    //     },
    //     inventoryItemId,
    //   },
    // });
    // const categorizedOptions: any = categorizeOptions(
    //   baseOptions,
    //   updatedOptions,
    // );

    // const today = getTodayDate();
    // const createdBy: any = await getCreatedBy(req, res);

    // const toUpdateOptions = categorizedOptions[ITEM_CATEGORIZED.UPDATE];
    // // console.log(toUpdateOptions)

    // const updatePromise = items.map((item: any) => {
    //   const itemOptions = item.options;

    //   // handle update
    //   return toUpdateOptions.map((toUpdateOption: any) => {
    //     const itemOptionToUpdate = itemOptions.find(
    //       (itemOption: any) => itemOption.name === toUpdateOption.queryName,
    //     );

    //     // console.log({itemOptionToUpdate, itemOptions, toUpdateOption})

    //     if (itemOptionToUpdate) {
    //       // UPDATE
    //       return prisma.option.update({
    //         where: {
    //           id: itemOptionToUpdate.id,
    //         },
    //         data: {
    //           name: toUpdateOption.name,
    //           price: toUpdateOption.price,
    //           prevPrice: toUpdateOption.prevPrice,
    //           isShowDiscount: toUpdateOption.isShowDiscount,
    //           unitId: toUpdateOption.unitId,
    //         },
    //       });
    //     } else {
    //       // CREATE
    //       return prisma.option.create({
    //         data: {
    //           name: toUpdateOption.name,
    //           price: toUpdateOption.price,
    //           availability: true,
    //           unitId: Number(toUpdateOption.unitId),
    //           createdAt: today.dateAndTime,
    //           createdBy,
    //           prevPrice: toUpdateOption?.prevPrice,
    //           isShowDiscount: toUpdateOption.isShowDiscount,
    //           inventoryItemId: item.inventoryItemId,
    //           itemId: item.id,
    //         },
    //       });
    //     }
    //   });
    // });

    // await Promise.all(updatePromise.flat());

    // // DELETE
    // const toDeleteOptions = categorizedOptions[ITEM_CATEGORIZED.DELETE];
    // if (toDeleteOptions.length > 0) {
    //   await prisma.option.deleteMany({
    //     where: {
    //       name: {
    //         in: toDeleteOptions.map((dOption: IOption) => dOption.name),
    //       },
    //       item: {
    //         inventoryItemId,
    //         categoryId: {
    //           in: categoryIds,
    //         },
    //       },
    //     },
    //   });
    // }

    // // Create new options
    // const toCreateOptions = categorizedOptions[ITEM_CATEGORIZED.CREATE];
    // console.log(categorizedOptions);
    // if (toCreateOptions.length > 0) {
    //   const promiseToCreateOptions = items.map(async (item: any) => {
    //     await prisma.option.createMany({
    //       data: categorizedOptions[ITEM_CATEGORIZED.CREATE].map(
    //         (option: any) => {
    //           return {
    //             name: option.name,
    //             price: option.price,
    //             availability: option?.availability || true,
    //             unitId: Number(option.unitId),
    //             createdAt: today.dateAndTime,
    //             createdBy,
    //             prevPrice: option?.prevPrice,
    //             isShowDiscount: option.isShowDiscount,
    //             inventoryItemId: item.inventoryItemId,
    //             itemId: item.id,
    //           };
    //         },
    //       ),
    //     });
    //   });
    //   await Promise.all(promiseToCreateOptions);
    // }

    // // UPDATE
    // const toUpdateOptions = categorizedOptions[ITEM_CATEGORIZED.UPDATE];
    // if (toUpdateOptions.length > 0) {
    //   for (const updatedOption of categorizedOptions[ITEM_CATEGORIZED.UPDATE]) {
    //     await prisma.option.updateMany({
    //       where: {
    //         name: updatedOption.queryName,
    //         item: {
    //           inventoryItemId,
    //           categoryId: {
    //             in: categoryIds,
    //           },
    //         },
    //       },
    //       data: {
    //         name: updatedOption.name,
    //         price: updatedOption.price,
    //         prevPrice: updatedOption.prevPrice,
    //         isShowDiscount: updatedOption.isShowDiscount,
    //         unitId: updatedOption.unitId,
    //       },
    //     });
    //   }
    // }

    // Handle update scheduled orders
    const responseStatus = await handleUpdateAllScheduleOrders(
      inventoryItemId,
      categoryIds,
      updatedOptions,
    );

    if (responseStatus.ok === false) {
      console.log(responseStatus.error);
      return res.status(400).json({ error: responseStatus.error });
    }

    const updatedItems = await prisma.item.findMany({
      where: {
        inventoryItemId,
        categoryId: {
          in: categoryIds,
        },
      },
      include: {
        options: {
          include: {
            unit: true,
            item: true,
          },
        },
        inventoryUnit: true,
        inventoryItem: {
          include: {
            vendorItem: {
              include: {
                unit: true,
              },
            },
            type: true,
          },
        },
        category: {
          include: {
            itemType_category: {
              include: {
                itemType: true,
              },
            },
          },
        },
      },
    });

    return res.status(200).json({
      message: 'Update Options Successfully',
      data: updatedItems,
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
};

export default withAdminAuthGuard(handler);

const handleUpdateAllScheduleOrders = async (
  inventoryItemId: number,
  categoryIds: number[],
  updatedOptions: any,
) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        categoryId: {
          in: categoryIds,
        },
      },
      include: {
        scheduleOrders: {
          include: {
            items: true,
          },
        },
      },
    });

    const targetOrderedItems = users.flatMap((user: any) => {
      return user.scheduleOrders.flatMap((scheduleOrder: any) => {
        return scheduleOrder.items.filter((item: any) => {
          return item.inventoryItemId === inventoryItemId;
        });
      });
    });

    // If there is no pre ordered items -> return
    if (targetOrderedItems.length === 0) {
      return { ok: true };
    }

    const promisesItem = targetOrderedItems.map((item: any) => {
      // 1st Case: Item Does not have option -> Assign to ratio of 1 or first option
      if (!item.option.name || !item.option.price || !item.option.ratio) {
        const ratioOf1 = updatedOptions.find(
          (option: any) => option.ratio === 1,
        );
        return prisma.orderedItems.update({
          where: {
            id: item.id,
          },
          data: {
            price: ratioOf1 ? ratioOf1.price : updatedOptions[0]?.price,
            prevPrice: ratioOf1
              ? ratioOf1.prevPrice
              : updatedOptions[0]?.prevPrice,
            isShowDiscount: ratioOf1
              ? ratioOf1.isShowDiscount
              : updatedOptions[0]?.isShowDiscount,
            option: {
              name: ratioOf1 ? ratioOf1.name : updatedOptions[0]?.name,
              price: ratioOf1 ? ratioOf1.price : updatedOptions[0]?.price,
              ratio: ratioOf1
                ? ratioOf1.unit.ratio
                : updatedOptions[0]?.unit?.ratio,
              prevPrice: ratioOf1
                ? ratioOf1.prevPrice
                : updatedOptions[0]?.prevPrice,
              isShowDiscount: ratioOf1
                ? ratioOf1.isShowDiscount
                : updatedOptions[0]?.isShowDiscount,
            },
          },
        });
      } else {
        // 2nd Case: Item has option
        const isOptionExisted = updatedOptions.find(
          (option: any) => option.name === item.option.name,
        );

        // If option is existed -> update
        if (isOptionExisted) {
          return prisma.orderedItems.update({
            where: {
              id: item.id,
            },
            data: {
              price: isOptionExisted.price,
              prevPrice: isOptionExisted?.prevPrice,
              isShowDiscount: isOptionExisted?.isShowDiscount,
              option: {
                name: isOptionExisted.name,
                price: isOptionExisted.price,
                ratio: isOptionExisted?.unit?.ratio,
                prevPrice: isOptionExisted?.prevPrice,
                isShowDiscount: isOptionExisted?.isShowDiscount,
              },
            },
          });
        } else {
          // If option is not existed -> assign to ratio of 1 or first option
          const ratioOf1 = updatedOptions.find(
            (option: any) => option.ratio === 1,
          );

          return prisma.orderedItems.update({
            where: {
              id: item.id,
            },
            data: {
              price: ratioOf1 ? ratioOf1.price : updatedOptions[0]?.price,
              prevPrice: ratioOf1
                ? ratioOf1.prevPrice
                : updatedOptions[0]?.prevPrice,
              isShowDiscount: ratioOf1
                ? ratioOf1.isShowDiscount
                : updatedOptions[0]?.isShowDiscount,
              option: {
                name: ratioOf1 ? ratioOf1.name : updatedOptions[0]?.name,
                price: ratioOf1 ? ratioOf1.price : updatedOptions[0]?.price,
                ratio: ratioOf1
                  ? ratioOf1.unit.ratio
                  : updatedOptions[0]?.unit?.ratio,
                prevPrice: ratioOf1
                  ? ratioOf1.prevPrice
                  : updatedOptions[0]?.prevPrice,
                isShowDiscount: ratioOf1
                  ? ratioOf1.isShowDiscount
                  : updatedOptions[0]?.isShowDiscount,
              },
            },
          });
        }
      }
    });

    await Promise.all(promisesItem);

    // Handle total price
    const scheduledOrders = await prisma.scheduleOrders.findMany({
      where: {
        userId: {
          in: users.map((user: any) => user.id),
        },
      },
      include: {
        items: true,
      },
    });

    const promisesOrder = scheduledOrders.map((order: any) => {
      const newTotalPrice = order.items.reduce((total: number, item: any) => {
        return total + item.price * item.quantity;
      }, 0);

      return prisma.scheduleOrders.update({
        where: {
          id: order.id,
        },
        data: {
          totalPrice: newTotalPrice,
        },
      });
    });

    await Promise.all(promisesOrder);
    return { ok: true, message: 'Update Options Successfully' };
  } catch (error: any) {
    return { ok: false, error };
  }
};

// const categorizeOptions = (
//   baseOptions: IOption[] | any,
//   updatedOptions: IOption[],
// ) => {
//   let trackBaseOptions = [...baseOptions];
//   const categorizedOptions = updatedOptions.map((option: IOption) => {
//     // Id will be string format if it is NEW
//     console.log({ option, compare: isNaN(option.id) }, 'option');
//     if (isNaN(option.id)) {
//       return {
//         ...option,
//         categorized: ITEM_CATEGORIZED.CREATE,
//       };
//     } else {
//       // Check if item exist in baseOptions
//       const existingOption = baseOptions.find(
//         (baseOption: IOption | any) => baseOption.id === option.id,
//       );
//       trackBaseOptions = trackBaseOptions.filter(
//         (baseOption: IOption | any) => baseOption.id !== option.id,
//       );
//       // if yes, return as update
//       if (existingOption) {
//         // UPDATE
//         return {
//           ...option,
//           queryName: existingOption.name,
//           categorized: ITEM_CATEGORIZED.UPDATE,
//         };
//       }
//     }
//   });

//   const deletedOptions = trackBaseOptions.map((dOption) => ({
//     ...dOption,
//     categorized: ITEM_CATEGORIZED.DELETE,
//   }));

//   // console.log(categorizedOptions, 'in function');

//   return {
//     [ITEM_CATEGORIZED.CREATE]: categorizedOptions.filter(
//       (cOption: any) => cOption.categorized === ITEM_CATEGORIZED.CREATE,
//     ),
//     [ITEM_CATEGORIZED.UPDATE]: categorizedOptions.filter(
//       (cOption: any) => cOption.categorized === ITEM_CATEGORIZED.UPDATE,
//     ),
//     [ITEM_CATEGORIZED.DELETE]: [...deletedOptions],
//   };
// };

// const cleanUpOptions = async (
//   baseOptions: IOption[],
//   otherItemsWithOptions: IItem[],
// ) => {
//   for (const item of otherItemsWithOptions) {
//     const itemOptions = item.options;

//     if (!itemOptions) {
//       console.error('Conflict item options not found');
//       continue;
//     }
//     const categorizedOptions = categorizeOptions(itemOptions, baseOptions);

//     // Check if any options need to create
//     if (categorizedOptions[ITEM_CATEGORIZED.CREATE].length > 0) {
//     }
//   }
// };
