import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
// const checkIsKorean = (text: string) => {
//   // const koreanRange = /^[\uAC00-\uD7AF]+$/;
//   const koreanRange = /[\uAC00-\uD7AF]/;
//   return koreanRange.test(text);
// };
async function main() {
  const allItemPref = await prisma.itemPreference.findMany({
    include: {
      inventoryItem: {
        include: {
          vendorItem: {
            include: {
              unit: true,
            },
          },
        },
      },
      inventoryUnit: true,
    },
  });

  for (const itemPref of allItemPref) {
    const unitRatioOf1 = itemPref.inventoryItem.vendorItem[0].unit.find(
      (unit: any) => unit.ratio === 1,
    );
    if (!unitRatioOf1) {
      console.log(
        'Could not find unit',
        itemPref.id,
        itemPref.inventoryItem.name,
      );

      continue;
    }
    console.log(itemPref.id, itemPref.inventoryItem.name);
    await prisma.itemPreference.update({
      where: {
        id: itemPref.id,
      },
      data: {
        inventoryUnitId: unitRatioOf1.id,
      },
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.log(error);
    await prisma.$disconnect();
    // process.exit(1);
  });
