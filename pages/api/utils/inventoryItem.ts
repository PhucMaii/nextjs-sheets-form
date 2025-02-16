import { PrismaClient } from "@prisma/client";

export const getInventoryItemQty = async (inventoryItemId: number) => {
    try {
        const prisma = new PrismaClient();

        const fifo = await prisma.fifo.findMany({
            where: {
                inventoryItemId
            }
        });

        const qty = fifo.reduce((total: number, item: any) => {
            return total + item.quantity;
        }, 0);

        return qty;
    } catch (error: any) {
        throw new Error('Fail to get qty by inventory item id');
    }
}