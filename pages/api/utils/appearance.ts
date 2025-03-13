import { itemsEachRow } from "@/app/lib/constant";
import { PrismaClient } from "@prisma/client";

export const calculateNextIndexPosAndRows = async (typeId: number, addedQuantity: number) => {
    try {
        const prisma = new PrismaClient();

        // Get type
        const type = await prisma.itemType.findUnique({
            where: {
                id: typeId,
            },
            include: {
                inventoryItems: true
            }
        });

        if (!type) {
            throw new Error('Item Type Not Found');
        }

        // Calculate index position
        // Add up index position to an array of length addedQuantity
        let indexPosition: number = 1;
        const nextPos: number[] = [];
        if (type.inventoryItems && type.inventoryItems.length > 0) {
            while (nextPos.length < addedQuantity) {
                indexPosition = (type.inventoryItems[type.inventoryItems.length - 1]?.indexPos || 1) + 1;
                nextPos.push(indexPosition);
            }
        }

        // Calculate rows
        // Simply divide index position - which is the last index position of new items - by items each row
        const newRows = Math.ceil(indexPosition / itemsEachRow);

        return {
            nextPos,
            newRows
        };
    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        throw new Error('Internal Server Error: ' + error);
    }
}

export const calculateNextPriority = async () => {
    try {
        const prisma = new PrismaClient();

        const allItemTypes = await prisma.itemType.findMany({
            orderBy: {
                priority: 'desc'
            }
        });

        if (allItemTypes && allItemTypes.length > 0) {
            const nextPriority = (allItemTypes[allItemTypes.length - 1]?.priority || 1) + 1;
            return nextPriority;
        }

        return 1;
    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        throw new Error('Internal Server Error: ' + error);
    }
}