import { NextApiRequest, NextApiResponse } from 'next';
import { checkAndUpdateUnits } from './expenses/POST';
import { getCreatedBy } from '@/pages/api/import-sheets/utils';
import { USER_ROLE } from '@/app/utils/enum';
import { getTodayDate } from '@/pages/api/utils/date';
import { updateAllScheduleOrderItems } from '../items/PUT';
import { UPDATE_OPTION } from '@/app/admin/[companyId]/components/Modals/edit/EditItem';
import { deleteItemInScheduledOrders } from '../items/DELETE';
import prisma from '@/client';
import { getUniqueUnitRatios } from '@/app/utils/array';

interface IBody {
  id: number;
  name: string;
  sku: string;
  supplierSku: string;
  hasPST?: boolean;
  hasGST?: boolean;
  vendorItems: any[];
  updatedSellingItems: any[];
  isShowInventory?: boolean;
  isInternal?: boolean;
  typeId: number;
  image: string;
  subtractRules: any[];
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({
        error: 'Company ID is required',
      });
    }

    const {
      id,
      name,
      sku,
      supplierSku,
      hasPST,
      hasGST,
      vendorItems,
      updatedSellingItems,
      isShowInventory,
      // updatedSingleSellingItem,
      isInternal,
      typeId,
      image,
      subtractRules,
    }: IBody = req.body;

    // console.log('req.body', req.body);

    const updatedAt = getTodayDate().dateAndTime;

    const existingInventoryItem = await prisma.inventoryItem.findUnique({
      where: {
        id,
      },
      include: {
        vendorItem: {
          include: {
            vendor: true,
            fifo: true,
            unit: true,
          },
        },
        item: {
          include: {
            inventoryUnit: true,
          },
        },
        subtractRules: {
          include: {
            dependentInventoryItem: true,
          },
        },
      },
    });

    if (!existingInventoryItem) {
      return res.status(404).json({
        error: 'Inventory Item Not Found',
      });
    }

    const sameNameInventoryItem = await prisma.inventoryItem.findFirst({
      where: {
        name,
        id: {
          not: existingInventoryItem.id,
        },
        companyId: Number(companyId),
      },
    });

    if (sameNameInventoryItem) {
      return res.status(400).json({
        error: 'Inventory Item Already Exists',
      });
    }

    if (existingInventoryItem?.isShowInventory !== isShowInventory) {
      await prisma.inventoryItem.update({
        where: {
          id,
        },
        data: {
          isShowInventory,
        },
      });
    }

    if (
      existingInventoryItem.name !== name ||
      existingInventoryItem.sku !== sku ||
      existingInventoryItem.supplierSku !== supplierSku
    ) {
      await prisma.inventoryItem.update({
        where: {
          id,
        },
        data: {
          name,
          sku,
          supplierSku,
        },
      });
    }

    if (
      existingInventoryItem.hasPST !== hasPST ||
      existingInventoryItem.hasGST !== hasGST
    ) {
      await prisma.inventoryItem.update({
        where: {
          id,
        },
        data: {
          hasPST,
          hasGST,
        },
      });
    }

    if (existingInventoryItem.isInternal !== isInternal) {
      await prisma.inventoryItem.update({
        where: { id },
        data: { isInternal },
      });
    }

    if (existingInventoryItem.typeId !== Number(typeId)) {
      await prisma.inventoryItem.update({
        where: { id },
        data: { typeId: Number(typeId) > 0 ? Number(typeId) : null },
      });
    }

    if (existingInventoryItem.image !== image) {
      await prisma.inventoryItem.update({
        where: { id },
        data: { image },
      });
    }

    const createdBy = await getCreatedBy(req, res, USER_ROLE.ADMIN);

    let dbInventoryItemLeft = existingInventoryItem.vendorItem;
    for (const updatedVendorItem of vendorItems) {
      if (
        !isNaN(Number(updatedVendorItem.vendorItemId)) &&
        Number(updatedVendorItem.vendorItemId) > 0
      ) {
        const existingVendorItem = existingInventoryItem.vendorItem.find(
          (item: any) => item.id === updatedVendorItem.vendorItemId,
        );

        if (!existingVendorItem) {
          console.error('Vendor Item Not Found');
          continue;
        }

        // Check if supplier sku is changed
        if (existingVendorItem.supplierSku !== updatedVendorItem.supplierSku) {
          await prisma.vendorItem.update({
            where: { id: existingVendorItem.id },
            data: { supplierSku: updatedVendorItem.supplierSku },
          });
        }

        // Check units and update units
        await checkAndUpdateUnits(
          Number(companyId),
          existingVendorItem.unit,
          updatedVendorItem.units,
          existingVendorItem.id,
          updatedAt,
          createdBy,
        );

        dbInventoryItemLeft = dbInventoryItemLeft.filter(
          (item: any) => item.id !== existingVendorItem.id,
        );
      } else {
        // Case: New Vendor Item
        const newVendorItem = await prisma.vendorItem.create({
          data: {
            inventoryItemId: id,
            supplierSku: updatedVendorItem.supplierSku,
            vendorId: updatedVendorItem.vendorId,
            quantity: updatedVendorItem?.quantity || 0,
            createdAt: updatedAt,
            createdBy,
            companyId: Number(companyId),
          },
        });

        // Create Inventory Unit
        await prisma.inventoryUnit.createMany({
          data: updatedVendorItem.units.map((unit: any) => {
            return {
              vendorItemId: newVendorItem.id,
              unit: unit.unit,
              unitPrice: unit.unitPrice,
              ratio: unit.ratio,
              createdAt: updatedAt,
              createdBy,
              companyId: Number(companyId),
            };
          }),
        });
      }
    }

    // Delete old vendor items
    if (dbInventoryItemLeft.length > 0) {
      const inventoryUnits = await prisma.inventoryUnit.findMany({
        where: {
          vendorItemId: {
            notIn: dbInventoryItemLeft.map((item: any) => item.id),
          },
          vendorItem: {
            inventoryItemId: existingInventoryItem.id,
          },
        },
      });

      const inventoryUnitsWillBeDeleted = await prisma.inventoryUnit.findMany({
        where: {
          vendorItemId: {
            in: dbInventoryItemLeft.map((item: any) => item.id),
          },
        },
      });

      // Move all item have inventory unit that will be deleted to first inventory unit
      await prisma.item.updateMany({
        where: {
          inventoryUnitId: {
            in: inventoryUnitsWillBeDeleted.map((item: any) => item.id),
          },
        },
        data: {
          inventoryUnitId: inventoryUnits[0].id,
        },
      });

      // Move all ordered item have inventory unit that will be deleted to first inventory unit
      await prisma.orderedItems.updateMany({
        where: {
          inventoryUnitId: {
            in: inventoryUnitsWillBeDeleted.map((item: any) => item.id),
          },
        },
        data: {
          inventoryUnitId: inventoryUnits[0].id,
        },
      });

      await prisma.vendorItem.deleteMany({
        where: {
          id: {
            in: dbInventoryItemLeft.map((item: any) => item.id),
          },
        },
      });
    }

    const allUnits = await prisma.inventoryUnit.findMany({
      where: {
        vendorItem: {
          inventoryItemId: existingInventoryItem.id,
        },
      },
    });

    const uniqueUnits = getUniqueUnitRatios(allUnits);
    const toChangeItems: any[] = [];
    if (updatedSellingItems && updatedSellingItems.length > 0) {
      const nonVariantsItems = updatedSellingItems.filter(
        (item: any) => !item.options || item.options.length === 0,
      );

      // only update non variants items
      const updatedItemPromises = nonVariantsItems.map(
        (updatedSellingItem: any) => {
          const existingSellingItem = existingInventoryItem.item.find(
            (item: any) => item.id === updatedSellingItem.itemId,
          );

          // New selling item just added
          if (!existingSellingItem) {
            return prisma.item.create({
              data: {
                name: updatedSellingItem.name,
                price: updatedSellingItem.price,
                inventoryUnitId: updatedSellingItem.inventoryUnit.id,
                availability: updatedSellingItem.availability,
                categoryId: updatedSellingItem.categoryId,
                inventoryItemId: existingInventoryItem.id,
                isShowDiscount: updatedSellingItem.isShowDiscount,
                prevPrice: updatedSellingItem.prevPrice,
                createdAt: updatedAt,
                createdBy,
                companyId: Number(companyId),
              },
            });
          }

          // Update selling item if name, price or inventory unit is changed
          if (
            existingSellingItem.name !== updatedSellingItem.name ||
            existingSellingItem.price !== updatedSellingItem.price ||
            existingSellingItem.inventoryUnit?.id !==
              updatedSellingItem.inventoryUnit.id ||
            existingSellingItem.isShowDiscount !==
              updatedSellingItem.isShowDiscount ||
            existingSellingItem.prevPrice !== updatedSellingItem.prevPrice
          ) {
            let unit: any = existingSellingItem.inventoryUnit;
            // check if inventory unit.id is correct
            if (isNaN(Number(updatedSellingItem.inventoryUnit.id))) {
              unit = uniqueUnits.find(
                (unit: any) =>
                  unit.ratio === updatedSellingItem.inventoryUnit.ratio,
              );
            }

            toChangeItems.push({
              id: existingSellingItem.id,
              name: updatedSellingItem.name,
              price: updatedSellingItem.price,
              inventoryUnitId: unit.id,
              isShowDiscount: updatedSellingItem.isShowDiscount,
              prevPrice: updatedSellingItem.prevPrice,
              categoryId: updatedSellingItem.categoryId,
              inventoryItemId: existingInventoryItem.id,
            });
            return prisma.item.update({
              where: { id: existingSellingItem.id },
              data: {
                name: updatedSellingItem.name,
                price: updatedSellingItem.price,
                inventoryUnitId: unit.id,
                isShowDiscount: updatedSellingItem.isShowDiscount,
                prevPrice: updatedSellingItem.prevPrice,
              },
            });
          }

          return null;
        },
      );

      const filteredUpdatedSellingItems = updatedItemPromises.filter(
        (item: any) => item !== null,
      );

      if (filteredUpdatedSellingItems.length > 0) {
        await Promise.all(filteredUpdatedSellingItems);
      }

      // Check if there is any selling item removed, removed selling item can be found in existingInventoryItem.item but not in updatedSellingItems
      const removedSellingItems = existingInventoryItem.item.filter(
        (item: any) =>
          !updatedSellingItems.some(
            (updatedItem: any) => updatedItem.itemId === item.id,
          ),
      );

      if (removedSellingItems.length > 0) {
        // Delete all removed selling item
        await deleteRelatedOrderedItemInScheduledOrders(removedSellingItems);
      }

      // Update schedule order items
      if (toChangeItems.length > 0) {
        const scheduledOrderItemPromises = toChangeItems.map((item: any) => {
          return updateAllScheduleOrderItems(
            item.categoryId,
            item.inventoryItemId,
            UPDATE_OPTION.CURRENT_CATEGORY,
            {
              name: item.name,
              price: item.price,
              inventoryUnitId: item.inventoryUnitId,
              isShowDiscount: item.isShowDiscount,
              prevPrice: item.prevPrice,
            },
          );
        });

        await Promise.all(scheduledOrderItemPromises);
      }
    }

    // Update automation rules
    if (subtractRules && subtractRules.length > 0) {
      const newRules = subtractRules.filter((rule: any) =>
        isNaN(Number(rule.id)),
      );
      const updatedRules = subtractRules.filter((rule: any) => {
        const existingRule = existingInventoryItem.subtractRules.find(
          (r: any) => r.id === rule.id,
        );

        if (!existingRule) {
          return false;
        }

        if (
          existingRule.subtractQty !== rule.subtractQty ||
          existingRule.relationalQty !== rule.relationalQty ||
          existingRule.frequency !== rule.frequency ||
          existingRule.isActive !== rule.isActive ||
          existingRule.dependentInventoryItemId !== rule.dependentInventoryItemId
        ) {
          return true;
        }

        return false;
      });

      const deletedRules = existingInventoryItem.subtractRules.filter(
        (rule: any) => {
          return !subtractRules.some((r: any) => r.id === rule.id);
        },
      );

      if (newRules.length > 0) {
        await prisma.automationRules.createMany({
          data: newRules.map((rule: any) => ({
            subtractQty: rule.subtractQty,
            inventoryItemId: existingInventoryItem.id,
            isActive: rule.isActive,
            relationalQty: rule?.relationalQty,
            frequency: rule?.frequency,
            dependentInventoryItemId: rule.dependentInventoryItemId,
            createdAt: updatedAt,
            createdBy,
            companyId: Number(companyId),
          })),
        });
      }

      if (updatedRules.length > 0) {
        for (const rule of updatedRules) {
          await prisma.automationRules.update({
            where: { id: rule.id },
            data: {
              subtractQty: rule.subtractQty,
              isActive: rule.isActive,
              relationalQty: rule?.relationalQty,
              frequency: rule?.frequency,
              dependentInventoryItemId: rule.dependentInventoryItemId,
            },
          });
        }
      }

      if (deletedRules.length > 0) {
        await prisma.automationRules.deleteMany({
          where: { id: { in: deletedRules.map((rule: any) => rule.id) } },
        });
      }
    }

    return res.status(200).json({
      message: 'Inventory Item Updated Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error :', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}

const deleteRelatedOrderedItemInScheduledOrders = async (
  deletedItems: any[],
) => {
  await prisma.item.deleteMany({
    where: {
      id: {
        in: deletedItems.map((item: any) => item.id),
      },
    },
  });

  // Delete its related ordered item in scheduled order
  const scheduledOrderItemPromises = deletedItems.map((item: any) => {
    return deleteItemInScheduledOrders(Number(item.companyId), item);
  });

  await Promise.all(scheduledOrderItemPromises);
};
