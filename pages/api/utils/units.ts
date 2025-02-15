import { IVendorItem } from "@/app/utils/type";
import { PrismaClient } from "@prisma/client"

export const getAllUnitsByInventoryItemId = async (inventoryItemId: number) => {
    if (inventoryItemId < 1) {
        return [];
    }
    const prisma = new PrismaClient();

    try {
        const inventoryItem = await prisma.inventoryItem.findUnique({
            where: {
                id: inventoryItemId
            },
            include: {
                vendorItem: {
                    include: {
                        unit: true
                    }
                }
            }
        });

        const allUnits = inventoryItem?.vendorItem.flatMap((vendorItem: IVendorItem) => {
            return vendorItem.unit;
        });

        return allUnits;
    } catch (error: any) {
        throw new Error('Fail to get units by inventory item id');
    }
}