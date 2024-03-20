import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await hash('maiphuc0102', 12);

  await prisma.category.createMany({
    data: [
      {
        name: 'Wholesale',
      },
      {
        name: 'Retail/Restaurant',
      },
      {
        name: 'Special price',
      },
    ],
  });

  await prisma.user.createMany({
    data: [
      {
        clientId: '00208',
        clientName: 'Mr. Ho Wonton House',
        sheetName: 'Mr. Ho',
        deliveryAddress: '6731 Kingsway, Burnaby, BC V5E 1E4',
        contactNumber: '16045406746',
        categoryId: 2,
        password,
        role: 'client',
      },
      {
        clientId: '00210',
        clientName: 'Brokenrice Vietnamese Restaurant',
        sheetName: 'Brokenrice',
        deliveryAddress: '4088 Hastings St, Burnaby, BC V5C 2H9',
        contactNumber: '16045583838',
        categoryId: 1,
        password,
        role: 'client',
      },
      {
        clientId: '1',
        clientName: 'Admin 1',
        sheetName: 'Admin 1',
        deliveryAddress: '1-6420 Beresford Street, Burnaby, BC, V5E 1B3',
        contactNumber: '7787891060',
        categoryId: 1,
        password,
        role: 'admin',
      },
    ],
  });

  await prisma.item.createMany({
    data: [
      {
        name: 'BEANSPROUTS 10 LBS',
        categoryId: 1,
        price: 8.50,
      },
      {
        name: 'BEANSPROUTS 10 LBS',
        categoryId: 2,
        price: 9.50,
      },
      {
        name: 'BEANSPROUTS 10 LBS',
        categoryId: 3,
        price: 9.50,
      },
      {
        name: 'BEANSPROUTS 5 LBS',
        categoryId: 1,
        price: 4.25,
      },
      {
        name: 'BEANSPROUTS 5 LBS',
        categoryId: 2,
        price: 4.75,
      },
      {
        name: 'BEANSPROUTS 5 LBS',
        categoryId: 3,
        price: 0,
      },
      // {
      //   name: 'SOYA SPROUTS 10 LBS',
      //   categoryId: 1,
      //   price: 20,
      // },
      // {
      //   name: 'SOYA SPROUTS 10 LBS',
      //   categoryId: 2,
      //   price: 18,
      // },
      // {
      //   name: 'SOYA SPROUTS 10 LBS',
      //   categoryId: 3,
      //   price: 15,
      // },
      // {
      //   name: 'SOYA SPROUTS 10 LBS',
      //   categoryId: 4,
      //   price: 10,
      // },
      // {
      //   name: 'SOYA SPROUTS 5 LBS',
      //   categoryId: 1,
      //   price: 16,
      // },
      // {
      //   name: 'SOYA SPROUTS 5 LBS',
      //   categoryId: 2,
      //   price: 14,
      // },
      // {
      //   name: 'SOYA SPROUTS 5 LBS',
      //   categoryId: 3,
      //   price: 12,
      // },
      // {
      //   name: 'SOYA SPROUTS 5 LBS',
      //   categoryId: 4,
      //   price: 10,
      // },
      {
        name: 'BASIL',
        categoryId: 1,
        price: 0,
      },
      {
        name: 'BASIL',
        categoryId: 2,
        price: 7.75,
      },
      {
        name: 'BASIL',
        categoryId: 3,
        price: 6.5,
      },
      {
        name: 'JUMBO EGGS',
        categoryId: 1,
        price: 0,
      },
      {
        name: 'JUMBO EGGS',
        categoryId: 2,
        price: 48,
      },
      {
        name: 'JUMBO EGGS',
        categoryId: 3,
        price: 0,
      },
      // {
      //   name: 'CUCCUMBER',
      //   categoryId: 1,
      //   price: 10,
      // },
      // {
      //   name: 'CUCCUMBER',
      //   categoryId: 2,
      //   price: 14,
      // },
      // {
      //   name: 'CUCCUMBER',
      //   categoryId: 3,
      //   price: 12,
      // },
      // {
      //   name: 'CUCCUMBER',
      //   categoryId: 4,
      //   price: 10,
      // },
      // {
      //   name: 'TOMATO',
      //   categoryId: 1,
      //   price: 10,
      // },
      // {
      //   name: 'TOMATO',
      //   categoryId: 2,
      //   price: 14,
      // },
      // {
      //   name: 'TOMATO',
      //   categoryId: 3,
      //   price: 12,
      // },
      // {
      //   name: 'TOMATO',
      //   categoryId: 4,
      //   price: 10,
      // },
    ],
  });

  await prisma.form.create({
    data: {
      formName: 'Order Form',
    },
  });

  await prisma.input.createMany({
    data: [
      {
        formId: 1,
        inputName: 'ORDER DATE',
        inputType: 'date',
      },
      {
        formId: 1,
        inputName: 'BEANSPROUTS 10 LBS',
        inputType: 'number',
      },
      {
        formId: 1,
        inputName: 'BEANSPROUTS 5 LBS',
        inputType: 'number',
      },
      {
        formId: 1,
        inputName: 'SOYA SPROUTS 10 LBS',
        inputType: 'number',
      },
      {
        formId: 1,
        inputName: 'SOYA SPROUTS 5 LBS',
        inputType: 'number',
      },
      {
        formId: 1,
        inputName: 'BASIL',
        inputType: 'number',
      },
      {
        formId: 1,
        inputName: 'JUMBO EGGS',
        inputType: 'number',
      },
      {
        formId: 1,
        inputName: 'CUCCUMBER',
        inputType: 'number',
      },
      {
        formId: 1,
        inputName: 'TOMATO',
        inputType: 'number',
      },
      {
        formId: 1,
        inputName: 'NOTE',
        inputType: 'text',
      },
    ],
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.log(error);
    await prisma.$disconnect();
    process.exit(1);
  });
