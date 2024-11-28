// import { generateCurrentTime } from '@/app/utils/time';
import { PrismaClient } from '@prisma/client';
// import moment from 'moment';
// import { generateUsers } from './userData';
// import { hash } from 'bcrypt';
// import { hash } from 'bcrypt';
// import { items } from './itemData';
// import { inputs } from './inputFieldData';

// const generateCurrentTime = () => {
//   const currentDate = new Date();
//   const dateString = moment(currentDate).format('YYYY-MM-DD');
//   const timeString = moment(currentDate).format('HH:mm:ss');

//   return `${timeString} ${dateString}`;
// };

const prisma = new PrismaClient();

async function main() {
  await prisma.vendorItem.deleteMany({
    where: {
      id: {
        gt: 106,
      },
    },
  });
  // const createdAt = generateCurrentTime();
  // const createdBy = `Admin - Admin Test`;

  // ******** LIQUID EGG ********
  // const liquidEgg = await prisma.vendorItem.create({
  //   data: {
  //     inventoryItemId: 17,
  //     vendorId: 7,
  //     quantity: 12,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // await prisma.inventoryUnit.create({
  //   data: {
  //     vendorItemId: liquidEgg.id,
  //     unit: 'cases',
  //     unitPrice: 82,
  //     ratio: 1,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // // ******** BEAN 10 LB ********
  // const bean10 = await prisma.vendorItem.create({
  //   data: {
  //     inventoryItemId: 18,
  //     vendorId: 4,
  //     quantity: 5000,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // await prisma.inventoryUnit.create({
  //   data: {
  //     vendorItemId: bean10.id,
  //     unit: 'bags',
  //     unitPrice: 6.5,
  //     ratio: 1,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // // ******** BEAN 5 LB ********
  // const bean5 = await prisma.vendorItem.create({
  //   data: {
  //     inventoryItemId: 19,
  //     vendorId: 4,
  //     quantity: 5000,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // await prisma.inventoryUnit.create({
  //   data: {
  //     vendorItemId: bean5.id,
  //     unit: 'bags',
  //     unitPrice: 3.25,
  //     ratio: 1,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // // ******** BEAN 1 LB ********
  // const bean1 = await prisma.vendorItem.create({
  //   data: {
  //     inventoryItemId: 20,
  //     vendorId: 4,
  //     quantity: 100,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // await prisma.inventoryUnit.create({
  //   data: {
  //     vendorItemId: bean1.id,
  //     unit: 'bags',
  //     unitPrice: 0.96,
  //     ratio: 1,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // await prisma.inventoryUnit.create({
  //   data: {
  //     vendorItemId: bean1.id,
  //     unit: '24 bags',
  //     unitPrice: 23,
  //     ratio: 24,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // // ******** KOREAN SOYA 1 LB ********
  // const koreanSoya = await prisma.vendorItem.create({
  //   data: {
  //     inventoryItemId: 21,
  //     vendorId: 4,
  //     quantity: 48,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // await prisma.inventoryUnit.create({
  //   data: {
  //     vendorItemId: koreanSoya.id,
  //     unit: 'bags',
  //     unitPrice: 1.25,
  //     ratio: 1,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // await prisma.inventoryUnit.create({
  //   data: {
  //     vendorItemId: koreanSoya.id,
  //     unit: 'cases',
  //     unitPrice: 30,
  //     ratio: 24,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // // ******** SILVER SPROUT 5 LB ********
  // const silverSprout = await prisma.vendorItem.create({
  //   data: {
  //     inventoryItemId: 22,
  //     vendorId: 4,
  //     quantity: 30,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // await prisma.inventoryUnit.create({
  //   data: {
  //     vendorItemId: silverSprout.id,
  //     unit: 'bags',
  //     unitPrice: 17.5,
  //     ratio: 1,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // // ******** SOYA 1 LB ********
  // const soya1 = await prisma.vendorItem.create({
  //   data: {
  //     inventoryItemId: 23,
  //     vendorId: 4,
  //     quantity: 4,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // await prisma.inventoryUnit.create({
  //   data: {
  //     vendorItemId: soya1.id,
  //     unit: 'bags',
  //     unitPrice: 0.96,
  //     ratio: 1,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // await prisma.inventoryUnit.create({
  //   data: {
  //     vendorItemId: soya1.id,
  //     unit: 'cases',
  //     unitPrice: 23,
  //     ratio: 24,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // // ******** JUMBO ONION 50 LB ********
  // const jumboOnion = await prisma.vendorItem.create({
  //   data: {
  //     inventoryItemId: 24,
  //     vendorId: 4,
  //     quantity: 0,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // await prisma.inventoryUnit.create({
  //   data: {
  //     vendorItemId: jumboOnion.id,
  //     unit: 'bags',
  //     unitPrice: 18,
  //     ratio: 1,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // // ******** NO. 1 MUSHROOM WHITE 10 LB ********
  // const no1MushroomWhite = await prisma.vendorItem.create({
  //   data: {
  //     inventoryItemId: 25,
  //     vendorId: 8,
  //     quantity: 43,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // await prisma.inventoryUnit.create({
  //   data: {
  //     vendorItemId: no1MushroomWhite.id,
  //     unit: 'cases',
  //     unitPrice: 26,
  //     ratio: 1,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // // ******** NO. 2 MUSHROOM WHITE 10 LB ********
  // const no2MushroomWhite = await prisma.vendorItem.create({
  //   data: {
  //     inventoryItemId: 26,
  //     vendorId: 8,
  //     quantity: 21,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // await prisma.inventoryUnit.create({
  //   data: {
  //     vendorItemId: no2MushroomWhite.id,
  //     unit: 'cases',
  //     unitPrice: 26,
  //     ratio: 1,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // // ******** BANH PHO SINCERE 30 LB ********
  // const banhPhoSincere = await prisma.vendorItem.create({
  //   data: {
  //     inventoryItemId: 40,
  //     vendorId: 9,
  //     quantity: 39,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // await prisma.inventoryUnit.create({
  //   data: {
  //     vendorItemId: banhPhoSincere.id,
  //     unit: 'cases',
  //     unitPrice: 39.5,
  //     ratio: 1,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // // ******** NO. 2 OYSTER MUSHROOM 5 LB ********
  // const no2OysterMushroom = await prisma.vendorItem.create({
  //   data: {
  //     inventoryItemId: 41,
  //     vendorId: 5,
  //     quantity: 3,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // await prisma.inventoryUnit.create({
  //   data: {
  //     vendorItemId: no2OysterMushroom.id,
  //     unit: 'cases',
  //     unitPrice: 7.5,
  //     ratio: 1,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // // ******** WHITE ONION 50 LB ********
  // const whiteOnion = await prisma.vendorItem.create({
  //   data: {
  //     inventoryItemId: 42,
  //     vendorId: 8,
  //     quantity: 11,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // await prisma.inventoryUnit.create({
  //   data: {
  //     vendorItemId: whiteOnion.id,
  //     unit: 'bags',
  //     unitPrice: 18,
  //     ratio: 1,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // // ******** LIME NO. 1 ********
  // const limeNo1HOK = await prisma.vendorItem.create({
  //   data: {
  //     inventoryItemId: 43,
  //     vendorId: 8,
  //     quantity: 8,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // const limeNo1CP = await prisma.vendorItem.create({
  //   data: {
  //     inventoryItemId: 43,
  //     vendorId: 11,
  //     quantity: 3,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // await prisma.inventoryUnit.create({
  //   data: {
  //     vendorItemId: limeNo1HOK.id,
  //     unit: 'cases',
  //     unitPrice: 45,
  //     ratio: 1,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // await prisma.inventoryUnit.create({
  //   data: {
  //     vendorItemId: limeNo1CP.id,
  //     unit: 'cases',
  //     unitPrice: 16,
  //     ratio: 1,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // // ******** WONTON NOODLE 1 LB ********
  // const wontonNoodle = await prisma.vendorItem.create({
  //   data: {
  //     inventoryItemId: 45,
  //     vendorId: 10,
  //     quantity: 20,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // await prisma.inventoryUnit.create({
  //   data: {
  //     vendorItemId: wontonNoodle.id,
  //     unit: 'lbs',
  //     unitPrice: 4.5,
  //     ratio: 1,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // // ******** BROCCOLI 20 LB ********
  // const broccoli = await prisma.vendorItem.create({
  //   data: {
  //     inventoryItemId: 46,
  //     vendorId: 11,
  //     quantity: 3,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // await prisma.inventoryUnit.create({
  //   data: {
  //     vendorItemId: broccoli.id,
  //     unit: 'cases',
  //     unitPrice: 20,
  //     ratio: 1,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // // ******** JUMBO CARROT ********
  // const jumboCarrotCP = await prisma.vendorItem.create({
  //   data: {
  //     inventoryItemId: 47,
  //     vendorId: 11,
  //     quantity: 100,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // const jumboCarrotHOK = await prisma.vendorItem.create({
  //   data: {
  //     inventoryItemId: 47,
  //     vendorId: 8,
  //     quantity: 100,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // await prisma.inventoryUnit.create({
  //   data: {
  //     vendorItemId: jumboCarrotCP.id,
  //     unit: 'cases',
  //     unitPrice: 15,
  //     ratio: 1,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // await prisma.inventoryUnit.create({
  //   data: {
  //     vendorItemId: jumboCarrotHOK.id,
  //     unit: 'cases',
  //     unitPrice: 18,
  //     ratio: 1,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // // ******** PEELED GARLIC ********
  // const peeledGarlic = await prisma.vendorItem.create({
  //   data: {
  //     inventoryItemId: 48,
  //     vendorId: 11,
  //     quantity: 10,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // await prisma.inventoryUnit.create({
  //   data: {
  //     vendorItemId: peeledGarlic.id,
  //     unit: 'bags',
  //     unitPrice: 10.33,
  //     ratio: 1,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // // ******** LARGE EGG ********
  // const largeEgg = await prisma.vendorItem.create({
  //   data: {
  //     inventoryItemId: 49,
  //     vendorId: 12,
  //     quantity: 0,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // await prisma.inventoryUnit.create({
  //   data: {
  //     vendorItemId: largeEgg.id,
  //     unit: 'cases',
  //     unitPrice: 52.99,
  //     ratio: 1,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // // ******** FRIED TOFU ********
  // const friedTofuSM = await prisma.vendorItem.create({
  //   data: {
  //     inventoryItemId: 50,
  //     vendorId: 13,
  //     quantity: 100,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // const friedTofuGV = await prisma.vendorItem.create({
  //   data: {
  //     inventoryItemId: 50,
  //     vendorId: 6,
  //     quantity: 100,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // await prisma.inventoryUnit.create({
  //   data: {
  //     vendorItemId: friedTofuSM.id,
  //     unit: 'cases',
  //     unitPrice: 30,
  //     ratio: 1,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // await prisma.inventoryUnit.create({
  //   data: {
  //     vendorItemId: friedTofuGV.id,
  //     unit: 'cases',
  //     unitPrice: 27.1,
  //     ratio: 1,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // // ******** BASIL ********
  // const basil = await prisma.vendorItem.create({
  //   data: {
  //     inventoryItemId: 51,
  //     vendorId: 14,
  //     quantity: 1000,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // await prisma.inventoryUnit.create({
  //   data: {
  //     vendorItemId: basil.id,
  //     unit: 'lbs',
  //     unitPrice: 5.5,
  //     ratio: 1,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // await prisma.inventoryUnit.create({
  //   data: {
  //     vendorItemId: basil.id,
  //     unit: 'cases',
  //     unitPrice: 110,
  //     ratio: 20,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // // ******** TRADITIONAL TOFU ********
  // const traditionalTofu = await prisma.vendorItem.create({
  //   data: {
  //     inventoryItemId: 52,
  //     vendorId: 6,
  //     quantity: 100,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // await prisma.inventoryUnit.create({
  //   data: {
  //     vendorItemId: traditionalTofu.id,
  //     unit: 'cases',
  //     unitPrice: 27.5,
  //     ratio: 1,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // // ******** MEDIUM FIRM TOFU ********
  // const mediumFirmTofu = await prisma.vendorItem.create({
  //   data: {
  //     inventoryItemId: 53,
  //     vendorId: 6,
  //     quantity: 100,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // await prisma.inventoryUnit.create({
  //   data: {
  //     vendorItemId: mediumFirmTofu.id,
  //     unit: 'cases',
  //     unitPrice: 23.7,
  //     ratio: 1,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // // ******** OG CHINESE PUFF ********
  // const ogChinesePuff = await prisma.vendorItem.create({
  //   data: {
  //     inventoryItemId: 54,
  //     vendorId: 6,
  //     quantity: 100,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // await prisma.inventoryUnit.create({
  //   data: {
  //     vendorItemId: ogChinesePuff.id,
  //     unit: 'cases',
  //     unitPrice: 29.6,
  //     ratio: 1,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // // ******** ORGANIC GINGER 30 LB ********
  // const organicGinger = await prisma.vendorItem.create({
  //   data: {
  //     inventoryItemId: 56,
  //     vendorId: 15,
  //     quantity: 100,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // await prisma.inventoryUnit.create({
  //   data: {
  //     vendorItemId: organicGinger.id,
  //     unit: 'cases',
  //     unitPrice: 50,
  //     ratio: 1,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // // ******** FRESH RICE NOODLES 30 LB ********
  // const freshRiceNoodles = await prisma.vendorItem.create({
  //   data: {
  //     inventoryItemId: 60,
  //     vendorId: 10,
  //     quantity: 100,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // await prisma.inventoryUnit.create({
  //   data: {
  //     vendorItemId: freshRiceNoodles.id,
  //     unit: 'bags',
  //     unitPrice: 1.3,
  //     ratio: 1,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // // ******** EGGPLANTS 30 LB ********
  // const eggplants = await prisma.vendorItem.create({
  //   data: {
  //     inventoryItemId: 64,
  //     vendorId: 16,
  //     quantity: 100,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // await prisma.inventoryUnit.create({
  //   data: {
  //     vendorItemId: eggplants.id,
  //     unit: 'cases',
  //     unitPrice: 15,
  //     ratio: 1,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // // ******** JUMBO EGG ********
  // const jumboEgg = await prisma.vendorItem.create({
  //   data: {
  //     inventoryItemId: 65,
  //     vendorId: 16,
  //     quantity: 100,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // await prisma.inventoryUnit.create({
  //   data: {
  //     vendorItemId: jumboEgg.id,
  //     unit: 'cases',
  //     unitPrice: 45,
  //     ratio: 1,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // // ******** SOYA 10 LB ********
  // const soya10 = await prisma.vendorItem.create({
  //   data: {
  //     inventoryItemId: 70,
  //     vendorId: 17,
  //     quantity: 100,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // await prisma.inventoryUnit.create({
  //   data: {
  //     vendorItemId: soya10.id,
  //     unit: 'bags',
  //     unitPrice: 0,
  //     ratio: 1,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // // ******** SOYA 5 LB ********
  // const soya5 = await prisma.vendorItem.create({
  //   data: {
  //     inventoryItemId: 71,
  //     vendorId: 17,
  //     quantity: 100,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // await prisma.inventoryUnit.create({
  //   data: {
  //     vendorItemId: soya5.id,
  //     unit: 'bags',
  //     unitPrice: 0,
  //     ratio: 1,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // // ******** DAIKON ********
  // const daikon = await prisma.vendorItem.create({
  //   data: {
  //     inventoryItemId: 72,
  //     vendorId: 11,
  //     quantity: 100,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // await prisma.inventoryUnit.create({
  //   data: {
  //     vendorItemId: daikon.id,
  //     unit: 'bags',
  //     unitPrice: 11,
  //     ratio: 1,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // // ******** NO. 1 OYSTER MUSHROOM 5 LB ********
  // const no1OysterMushroom = await prisma.vendorItem.create({
  //   data: {
  //     inventoryItemId: 73,
  //     vendorId: 18,
  //     quantity: 100,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // await prisma.inventoryUnit.create({
  //   data: {
  //     vendorItemId: no1OysterMushroom.id,
  //     unit: 'cases',
  //     unitPrice: 0,
  //     ratio: 1,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // // ******** GINGER 30 LB ********
  // const ginger = await prisma.vendorItem.create({
  //   data: {
  //     inventoryItemId: 74,
  //     vendorId: 11,
  //     quantity: 100,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // await prisma.inventoryUnit.create({
  //   data: {
  //     vendorItemId: ginger.id,
  //     unit: 'cases',
  //     unitPrice: 0,
  //     ratio: 1,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // // ******** FISH SAUCE ********
  // const fishSauce = await prisma.vendorItem.create({
  //   data: {
  //     inventoryItemId: 75,
  //     vendorId: 9,
  //     quantity: 100,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // await prisma.inventoryUnit.create({
  //   data: {
  //     vendorItemId: fishSauce.id,
  //     unit: 'cases',
  //     unitPrice: 0,
  //     ratio: 1,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // // ******** TARO ********
  // const taro = await prisma.vendorItem.create({
  //   data: {
  //     inventoryItemId: 76,
  //     vendorId: 11,
  //     quantity: 100,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // await prisma.inventoryUnit.create({
  //   data: {
  //     vendorItemId: taro.id,
  //     unit: 'bags',
  //     unitPrice: 47,
  //     ratio: 1,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // // ******** LIME NO. 2 ********
  // const limeNo2 = await prisma.vendorItem.create({
  //   data: {
  //     inventoryItemId: 77,
  //     vendorId: 11,
  //     quantity: 100,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // await prisma.inventoryUnit.create({
  //   data: {
  //     vendorItemId: limeNo2.id,
  //     unit: 'cases',
  //     unitPrice: 18,
  //     ratio: 1,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // // ******** LEMON ********
  // const lemon = await prisma.vendorItem.create({
  //   data: {
  //     inventoryItemId: 78,
  //     vendorId: 11,
  //     quantity: 100,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // await prisma.inventoryUnit.create({
  //   data: {
  //     vendorItemId: lemon.id,
  //     unit: 'cases',
  //     unitPrice: 0,
  //     ratio: 1,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // // ******** FIRM TOFU ********
  // const firmTofu = await prisma.vendorItem.create({
  //   data: {
  //     inventoryItemId: 79,
  //     vendorId: 6,
  //     quantity: 100,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // await prisma.inventoryUnit.create({
  //   data: {
  //     vendorItemId: firmTofu.id,
  //     unit: 'cases',
  //     unitPrice: 0,
  //     ratio: 1,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // // ******** SILKEN TUBE TOFU ********
  // const silkenTubeTofu = await prisma.vendorItem.create({
  //   data: {
  //     inventoryItemId: 80,
  //     vendorId: 6,
  //     quantity: 100,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // await prisma.inventoryUnit.create({
  //   data: {
  //     vendorItemId: silkenTubeTofu.id,
  //     unit: 'cases',
  //     unitPrice: 0,
  //     ratio: 1,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // // ******** NO. 2 BELL PEPPER 25 LB ********
  // const no2BellPepper = await prisma.vendorItem.create({
  //   data: {
  //     inventoryItemId: 81,
  //     vendorId: 18,
  //     quantity: 100,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // await prisma.inventoryUnit.create({
  //   data: {
  //     vendorItemId: no2BellPepper.id,
  //     unit: 'cases',
  //     unitPrice: 0,
  //     ratio: 1,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // // ******** POTATO ********
  // const potato = await prisma.vendorItem.create({
  //   data: {
  //     inventoryItemId: 82,
  //     vendorId: 11,
  //     quantity: 100,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // await prisma.inventoryUnit.create({
  //   data: {
  //     vendorItemId: potato.id,
  //     unit: 'bags',
  //     unitPrice: 0,
  //     ratio: 1,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // // ******** KING OYSTER ********
  // const kingOyster = await prisma.vendorItem.create({
  //   data: {
  //     inventoryItemId: 83,
  //     vendorId: 18,
  //     quantity: 100,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // await prisma.inventoryUnit.create({
  //   data: {
  //     vendorItemId: kingOyster.id,
  //     unit: 'cases',
  //     unitPrice: 0,
  //     ratio: 1,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // // ******** SHIITAKE ********
  // const shiitake = await prisma.vendorItem.create({
  //   data: {
  //     inventoryItemId: 84,
  //     vendorId: 18,
  //     quantity: 100,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // await prisma.inventoryUnit.create({
  //   data: {
  //     vendorItemId: shiitake.id,
  //     unit: 'cases',
  //     unitPrice: 0,
  //     ratio: 1,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // // ******** CHOW MEIN 10 LB ********
  // const chowMein = await prisma.vendorItem.create({
  //   data: {
  //     inventoryItemId: 85,
  //     vendorId: 17,
  //     quantity: 100,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // await prisma.inventoryUnit.create({
  //   data: {
  //     vendorItemId: chowMein.id,
  //     unit: 'bags',
  //     unitPrice: 0,
  //     ratio: 1,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // // ******** XL EGG ********
  // const xlEgg = await prisma.vendorItem.create({
  //   data: {
  //     inventoryItemId: 86,
  //     vendorId: 18,
  //     quantity: 100,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // await prisma.inventoryUnit.create({
  //   data: {
  //     vendorItemId: xlEgg.id,
  //     unit: 'bags',
  //     unitPrice: 0,
  //     ratio: 1,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // // ******** BAC HA 20 LB ********
  // const bacHa = await prisma.vendorItem.create({
  //   data: {
  //     inventoryItemId: 87,
  //     vendorId: 14,
  //     quantity: 100,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // await prisma.inventoryUnit.create({
  //   data: {
  //     vendorItemId: bacHa.id,
  //     unit: 'cases',
  //     unitPrice: 0,
  //     ratio: 1,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // // ******** USA GREEN CABBAGE ********
  // const greenCabbage = await prisma.vendorItem.create({
  //   data: {
  //     inventoryItemId: 88,
  //     vendorId: 11,
  //     quantity: 100,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // await prisma.inventoryUnit.create({
  //   data: {
  //     vendorItemId: greenCabbage.id,
  //     unit: 'cases',
  //     unitPrice: 0,
  //     ratio: 1,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // // ******** PREMIUM SOFT TOFU ********
  // const premiumSoftTofu = await prisma.vendorItem.create({
  //   data: {
  //     inventoryItemId: 89,
  //     vendorId: 6,
  //     quantity: 100,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // await prisma.inventoryUnit.create({
  //   data: {
  //     vendorItemId: premiumSoftTofu.id,
  //     unit: 'cases',
  //     unitPrice: 0,
  //     ratio: 1,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // // ******** SOFT TOFU ********
  // const softTofu = await prisma.vendorItem.create({
  //   data: {
  //     inventoryItemId: 90,
  //     vendorId: 6,
  //     quantity: 100,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // await prisma.inventoryUnit.create({
  //   data: {
  //     vendorItemId: softTofu.id,
  //     unit: 'cases',
  //     unitPrice: 0,
  //     ratio: 1,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // // ******** TOFU PUFF ********
  // const tofuPuff = await prisma.vendorItem.create({
  //   data: {
  //     inventoryItemId: 91,
  //     vendorId: 6,
  //     quantity: 100,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // await prisma.inventoryUnit.create({
  //   data: {
  //     vendorItemId: tofuPuff.id,
  //     unit: 'cases',
  //     unitPrice: 0,
  //     ratio: 1,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // // ******** BROWN MUSHTOOM 5 LB ********
  // const brownMushroom = await prisma.vendorItem.create({
  //   data: {
  //     inventoryItemId: 92,
  //     vendorId: 18,
  //     quantity: 100,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // await prisma.inventoryUnit.create({
  //   data: {
  //     vendorItemId: brownMushroom.id,
  //     unit: 'cases',
  //     unitPrice: 0,
  //     ratio: 1,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // // ******** BAC HA 30 LB ********
  // const bacHa30 = await prisma.vendorItem.create({
  //   data: {
  //     inventoryItemId: 93,
  //     vendorId: 14,
  //     quantity: 100,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // await prisma.inventoryUnit.create({
  //   data: {
  //     vendorItemId: bacHa30.id,
  //     unit: 'cases',
  //     unitPrice: 0,
  //     ratio: 1,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // // ******** OYSTER PRE PACKED ********
  // const oysterPrePacked = await prisma.vendorItem.create({
  //   data: {
  //     inventoryItemId: 95,
  //     vendorId: 18,
  //     quantity: 100,
  //     createdAt,
  //     createdBy
  //   }
  // });

  // await prisma.inventoryUnit.create({
  //   data: {
  //     vendorItemId: oysterPrePacked.id,
  //     unit: 'cases',
  //     unitPrice: 0,
  //     ratio: 1,
  //     createdAt,
  //     createdBy
  //   }
  // });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.log(error);
    await prisma.$disconnect();
    // process.exit(1);
  });
