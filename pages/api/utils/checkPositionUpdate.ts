import { PositionType } from '@/app/utils/type';
import { PrismaClient } from '@prisma/client';

export default async function checkPositionUpdate(
  prisma: PrismaClient,
  updatePosition: PositionType,
) {
  try {
    const isPositionValid = await prisma.position.findMany({
      where: {
        formId: updatePosition.formId,
        sheetName: updatePosition.sheetName,
        row: updatePosition.row,
      },
    });
    return isPositionValid.length === 0;
  } catch (error) {
    console.log(error);
  }
}
