import { PrismaClient } from "@prisma/client";
import { BodyType } from "../position/type";

export default async function checkPositionUpdate(prisma: PrismaClient, updatePosition: BodyType) {
    try {
        const isPositionValid = await prisma.position.findMany({
            where: {
                sheetName: updatePosition.sheetName,
                row: updatePosition.row
            }
        })
        return isPositionValid.length === 0; 
    } catch(error) {
        console.log(error);
    }
}