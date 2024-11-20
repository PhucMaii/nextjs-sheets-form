import { generateCurrentTime } from '@/app/utils/time';
import { PrismaClient } from '@prisma/client';
// import { generateUsers } from './userData';
// import { hash } from 'bcrypt';
// import { hash } from 'bcrypt';
// import { items } from './itemData';
// import { inputs } from './inputFieldData';

const prisma = new PrismaClient();

async function main() {
  const createdAt = generateCurrentTime();
  const createdBy = `Admin - Admin Test`;

  // ******** LIQUID EGG ********
  const liquidEgg = await prisma.vendorItem.create({
    data: {
      inventoryItemId: 17,
      vendorId: 7,
      quantity: 12,
      createdAt,
      createdBy
    }
  });

  await prisma.inventoryUnit.create({
    data: {
      vendorItemId: liquidEgg.id,
      unit: 'cases',
      unitPrice: 82,
      ratio: 1,
      createdAt,
      createdBy
    }
  });

  // ******** BEAN 10 LB ********
  const bean10 = await prisma.vendorItem.create({
    data: {
      inventoryItemId: 18,
      vendorId: 4,
      quantity: 5000,
      createdAt,
      createdBy
    }
  });

  await prisma.inventoryUnit.create({
    data: {
      vendorItemId: bean10.id,
      unit: 'bags',
      unitPrice: 6.5,
      ratio: 1,
      createdAt,
      createdBy
    }
  });

  // ******** BEAN 5 LB ********
  const bean5 = await prisma.vendorItem.create({
    data: {
      inventoryItemId: 19,
      vendorId: 4,
      quantity: 5000,
      createdAt,
      createdBy
    }
  });

  await prisma.inventoryUnit.create({
    data: {
      vendorItemId: bean5.id,
      unit: 'bags',
      unitPrice: 3.25,
      ratio: 1,
      createdAt,
      createdBy
    }
  });

  // ******** BEAN 1 LB ********
  const bean1 = await prisma.vendorItem.create({
    data: {
      inventoryItemId: 20,
      vendorId: 4,
      quantity: 100,
      createdAt,
      createdBy
    }
  });

  await prisma.inventoryUnit.create({
    data: {
      vendorItemId: bean1.id,
      unit: 'bags',
      unitPrice: 0.96,
      ratio: 1,
      createdAt,
      createdBy
    }
  });

  await prisma.inventoryUnit.create({
    data: {
      vendorItemId: bean1.id,
      unit: '24 bags',
      unitPrice: 23,
      ratio: 24,
      createdAt,
      createdBy
    }
  });

  // ******** KOREAN SOYA 1 LB ********
  const koreanSoya = await prisma.vendorItem.create({
    data: {
      inventoryItemId: 21,
      vendorId: 4,
      quantity: 48,
      createdAt,
      createdBy
    }
  });

  await prisma.inventoryUnit.create({
    data: {
      vendorItemId: koreanSoya.id,
      unit: 'bags',
      unitPrice: 1.25,
      ratio: 1,
      createdAt,
      createdBy
    }
  });

  await prisma.inventoryUnit.create({
    data: {
      vendorItemId: koreanSoya.id,
      unit: 'cases',
      unitPrice: 30,
      ratio: 24,
      createdAt,
      createdBy
    }
  });

  // ******** SILVER SPROUT 5 LB ********
  const silverSprout = await prisma.vendorItem.create({
    data: {
      inventoryItemId: 22,
      vendorId: 4,
      quantity: 30,
      createdAt,
      createdBy
    }
  });

  await prisma.inventoryUnit.create({
    data: {
      vendorItemId: silverSprout.id,
      unit: 'bags',
      unitPrice: 17.5,
      ratio: 1,
      createdAt,
      createdBy
    }
  });

  // ******** SOYA 1 LB ********
  const soya1 = await prisma.vendorItem.create({
    data: {
      inventoryItemId: 23,
      vendorId: 4,
      quantity: 4,
      createdAt,
      createdBy
    }
  });

  await prisma.inventoryUnit.create({
    data: {
      vendorItemId: soya1.id,
      unit: 'bags',
      unitPrice: 0.96,
      ratio: 1,
      createdAt,
      createdBy
    }
  });

  await prisma.inventoryUnit.create({
    data: {
      vendorItemId: soya1.id,
      unit: 'cases',
      unitPrice: 23,
      ratio: 24,
      createdAt,
      createdBy
    }
  });

  // ******** JUMBO ONION 50 LB ********
  const jumboOnion = await prisma.vendorItem.create({
    data: {
      inventoryItemId: 24,
      vendorId: 4,
      quantity: 0,
      createdAt,
      createdBy
    }
  });

  await prisma.inventoryUnit.create({
    data: {
      vendorItemId: jumboOnion.id,
      unit: 'bags',
      unitPrice: 18,
      ratio: 1,
      createdAt,
      createdBy
    }
  });

  // ******** NO. 1 MUSHROOM WHITE 10 LB ********
  const no1MushroomWhite = await prisma.vendorItem.create({
    data: {
      inventoryItemId: 25,
      vendorId: 8,
      quantity: 43,
      createdAt,
      createdBy
    }
  });

  await prisma.inventoryUnit.create({
    data: {
      vendorItemId: no1MushroomWhite.id,
      unit: 'cases',
      unitPrice: 26,
      ratio: 1,
      createdAt,
      createdBy
    }
  });

  // ******** NO. 2 MUSHROOM WHITE 10 LB ********
  const no2MushroomWhite = await prisma.vendorItem.create({
    data: {
      inventoryItemId: 26,
      vendorId: 8,
      quantity: 21,
      createdAt,
      createdBy
    }
  });

  await prisma.inventoryUnit.create({
    data: {
      vendorItemId: no2MushroomWhite.id,
      unit: 'cases',
      unitPrice: 26,
      ratio: 1,
      createdAt,
      createdBy
    }
  });

  // ******** BANH PHO SINCERE 30 LB ********
  const banhPhoSincere = await prisma.vendorItem.create({
    data: {
      inventoryItemId: 40,
      vendorId: 9,
      quantity: 39,
      createdAt,
      createdBy
    }
  });

  await prisma.inventoryUnit.create({
    data: {
      vendorItemId: banhPhoSincere.id,
      unit: 'cases',
      unitPrice: 39.5,
      ratio: 1,
      createdAt,
      createdBy
    }
  });

  // ******** NO. 2 OYSTER MUSHROOM 5 LB ********
  const no2OysterMushroom = await prisma.vendorItem.create({
    data: {
      inventoryItemId: 41,
      vendorId: 5,
      quantity: 3,
      createdAt,
      createdBy
    }
  });

  await prisma.inventoryUnit.create({
    data: {
      vendorItemId: no2OysterMushroom.id,
      unit: 'cases',
      unitPrice: 7.5,
      ratio: 1,
      createdAt,
      createdBy
    }
  });

  // ******** WHITE ONION 50 LB ********
  const whiteOnion = await prisma.vendorItem.create({
    data: {
      inventoryItemId: 42,
      vendorId: 8,
      quantity: 11,
      createdAt,
      createdBy
    }
  });

  await prisma.inventoryUnit.create({
    data: {
      vendorItemId: whiteOnion.id,
      unit: 'bags',
      unitPrice: 18,
      ratio: 1,
      createdAt,
      createdBy
    }
  });

  // ******** LIME NO. 1 ********
  const limeNo1HOK = await prisma.vendorItem.create({
    data: {
      inventoryItemId: 43,
      vendorId: 8,
      quantity: 8,
      createdAt,
      createdBy
    }
  });

  const limeNo1CP = await prisma.vendorItem.create({
    data: {
      inventoryItemId: 43,
      vendorId: 11,
      quantity: 3,
      createdAt,
      createdBy
    }
  });

  await prisma.inventoryUnit.create({
    data: {
      vendorItemId: limeNo1HOK.id,
      unit: 'cases',
      unitPrice: 45,
      ratio: 1,
      createdAt,
      createdBy
    }
  });

  await prisma.inventoryUnit.create({
    data: {
      vendorItemId: limeNo1CP.id,
      unit: 'cases',
      unitPrice: 16,
      ratio: 1,
      createdAt,
      createdBy
    }
  });

  // ******** WONTON NOODLE 1 LB ********
  const wontonNoodle = await prisma.vendorItem.create({
    data: {
      inventoryItemId: 45,
      vendorId: 10,
      quantity: 20,
      createdAt,
      createdBy
    }
  });

  await prisma.inventoryUnit.create({
    data: {
      vendorItemId: wontonNoodle.id,
      unit: 'lbs',
      unitPrice: 4.5,
      ratio: 1,
      createdAt,
      createdBy
    }
  });

  // ******** BROCCOLI 20 LB ********
  const broccoli = await prisma.vendorItem.create({
    data: {
      inventoryItemId: 46,
      vendorId: 11,
      quantity: 3,
      createdAt,
      createdBy
    }
  });

  await prisma.inventoryUnit.create({
    data: {
      vendorItemId: broccoli.id,
      unit: 'cases',
      unitPrice: 20,
      ratio: 1,
      createdAt,
      createdBy
    }
  });

  // ******** JUMBO CARROT ********
  const jumboCarrot = await prisma.vendorItem.create({
    data: {
      inventoryItemId: 47,
      vendorId: 11,
      quantity: 6,
      createdAt,
      createdBy
    }
  });

  await prisma.inventoryUnit.create({
    data: {
      vendorItemId: jumboCarrot.id,
      unit: 'cases',
      unitPrice: 15,
      ratio: 1,
      createdAt,
      createdBy
    }
  });

  // ******** PEELED GARLIC ********
  const peeledGarlic = await prisma.vendorItem.create({
    data: {
      inventoryItemId: 48,
      vendorId: 11,
      quantity: 10,
      createdAt,
      createdBy
    }
  });

  await prisma.inventoryUnit.create({
    data: {
      vendorItemId: peeledGarlic.id,
      unit: 'bags',
      unitPrice: 10.33,
      ratio: 1,
      createdAt,
      createdBy
    }
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.log(error);
    await prisma.$disconnect();
    // process.exit(1);
  });
