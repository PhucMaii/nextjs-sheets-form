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
        name: 'Wholesale - partner 1',
      },
      {
        name: 'Wholesale - partner 2',
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
        clientId: '00101',
        clientName: 'Phở Hồng Vietnamese Restaurant',
        sheetName: '00101',
        deliveryAddress: '5975 Kingsway, Burnaby, BC V5J 1H1',
        contactNumber: '16044549727',
        categoryId: 4,
        password,
        role: 'client',
      },
      {
        clientId: '00114',
        clientName: 'Doli Supermarket Ltd.',
        sheetName: '00114',
        deliveryAddress: '5818 Victoria Dr, Vancouver, BC V5P 3W9',
        contactNumber: '16043250899',
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
        price: 8.5,
      },
      {
        name: 'BEANSPROUTS 10 LBS',
        categoryId: 2,
        price: 7.5,
      },
      {
        name: 'BEANSPROUTS 10 LBS',
        categoryId: 3,
        price: 8.5,
      },
      {
        name: 'BEANSPROUTS 10 LBS',
        categoryId: 4,
        price: 9.5,
      },
      {
        name: 'BEANSPROUTS 10 LBS',
        categoryId: 5,
        price: 9.5,
      },
      {
        name: 'BEANSPROUTS 5 LBS',
        categoryId: 1,
        price: 4.25,
      },
      {
        name: 'BEANSPROUTS 5 LBS',
        categoryId: 2,
        price: 3.75,
      },
      {
        name: 'BEANSPROUTS 5 LBS',
        categoryId: 3,
        price: 4.25,
      },
      {
        name: 'BEANSPROUTS 5 LBS',
        categoryId: 4,
        price: 4.75,
      },
      {
        name: 'BEANSPROUTS 5 LBS',
        categoryId: 5,
        price: 4.75,
      },
      {
        name: 'BEANSPROUTS 24 x 1 LB',
        categoryId: 1,
        price: 26,
      },
      {
        name: 'BEANSPROUTS 5 x 1 LB',
        categoryId: 1,
        price: 6.25,
      },
      {
        name: 'SOYA SPROUTS 10 LBS',
        categoryId: 1,
        price: 8.5,
      },
      {
        name: 'SOYA SPROUTS 10 LBS',
        categoryId: 2,
        price: 7.5,
      },
      {
        name: 'SOYA SPROUTS 10 LBS',
        categoryId: 3,
        price: 8.5,
      },
      {
        name: 'SOYA SPROUTS 10 LBS',
        categoryId: 4,
        price: 9.5,
      },
      {
        name: 'SOYA SPROUTS 5 LBS',
        categoryId: 1,
        price: 4.25,
      },
      {
        name: 'SOYA SPROUTS 5 LBS',
        categoryId: 2,
        price: 3.75,
      },
      {
        name: 'SOYA SPROUTS 5 LBS',
        categoryId: 3,
        price: 4.25,
      },
      {
        name: 'SOYA SPROUTS 5 LBS',
        categoryId: 4,
        price: 4.75,
      },
      {
        name: 'SOYA SPROUTS 24 x 1 LB',
        categoryId: 4,
        price: 4.75,
      },
      {
        name: 'BASIL',
        categoryId: 4,
        price: 7.5,
      },
      {
        name: 'BASIL',
        categoryId: 5,
        price: 7.5,
      },
      // {
      //   name: 'JUMBO EGGS',
      //   categoryId: 1,
      //   price: 0,
      // },
      // {
      //   name: 'JUMBO EGGS',
      //   categoryId: 2,
      //   price: 48,
      // },
      // {
      //   name: 'JUMBO EGGS',
      //   categoryId: 3,
      //   price: 0,
      // },
      {
        name: 'CUCCUMBER',
        categoryId: 2,
        price: 1,
      },
      {
        name: 'CUCCUMBER',
        categoryId: 4,
        price: 1.25,
      },
      {
        name: 'CUCCUMBER',
        categoryId: 5,
        price: 1,
      },
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
      {
        name: 'LIMES',
        categoryId: 2,
        price: 30,
      },
      {
        name: 'LIMES',
        categoryId: 4,
        price: 40,
      },
      {
        name: 'LIMES',
        categoryId: 2,
        price: 35,
      },
    ],
  });

  await prisma.form.createMany({
    data: [
      {
        formName: 'Order Form',
        categoryId: 1,
      },
      {
        formName: 'Order Form',
        categoryId: 2,
      },
      {
        formName: 'Order Form',
        categoryId: 3,
      },
      {
        formName: 'Order Form',
        categoryId: 4,
      },
      {
        formName: 'Order Form',
        categoryId: 5,
      },
    ],
  });

  await prisma.input.createMany({
    data: [
      // Form 1
      {
        formId: 1,
        inputName: 'DELIVERY DATE',
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
        inputName: 'BEANSPROUTS 24 x 1 LB',
        inputType: 'number',
      },
      {
        formId: 1,
        inputName: 'BEANSPROUTS 5 x 1 LB',
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
        inputName: 'SOYA SPROUTS 24 x 1 LB',
        inputType: 'number',
      },
      {
        formId: 1,
        inputName: 'BASIL',
        inputType: 'number',
      },
      {
        formId: 1,
        inputName: 'NOTE',
        inputType: 'text',
      },
      //  Form 2
      {
        formId: 2,
        inputName: 'DELIVERY DATE',
        inputType: 'date',
      },
      {
        formId: 2,
        inputName: 'BEANSPROUTS 10 LBS',
        inputType: 'number',
      },
      {
        formId: 2,
        inputName: 'BEANSPROUTS 5 LBS',
        inputType: 'number',
      },
      {
        formId: 2,
        inputName: 'SOYA SPROUTS 10 LBS',
        inputType: 'number',
      },
      {
        formId: 2,
        inputName: 'SOYA SPROUTS 5 LBS',
        inputType: 'number',
      },
      {
        formId: 2,
        inputName: 'CUCCUMBER',
        inputType: 'number',
      },
      {
        formId: 2,
        inputName: 'LIMES',
        inputType: 'number',
      },
      {
        formId: 2,
        inputName: 'NOTE',
        inputType: 'text',
      },
      // Form 3
      {
        formId: 3,
        inputName: 'DELIVERY DATE',
        inputType: 'date',
      },
      {
        formId: 3,
        inputName: 'BEANSPROUTS 10 LBS',
        inputType: 'number',
      },
      {
        formId: 3,
        inputName: 'BEANSPROUTS 5 LBS',
        inputType: 'number',
      },
      {
        formId: 3,
        inputName: 'SOYA SPROUTS 10 LBS',
        inputType: 'number',
      },
      {
        formId: 3,
        inputName: 'SOYA SPROUTS 5 LBS',
        inputType: 'number',
      },
      {
        formId: 3,
        inputName: 'NOTE',
        inputType: 'text',
      },
      // Form 4
      {
        formId: 4,
        inputName: 'DELIVERY DATE',
        inputType: 'date',
      },
      {
        formId: 4,
        inputName: 'BEANSPROUTS 10 LBS',
        inputType: 'number',
      },
      {
        formId: 4,
        inputName: 'BEANSPROUTS 5 LBS',
        inputType: 'number',
      },
      {
        formId: 4,
        inputName: 'SOYA SPROUTS 10 LBS',
        inputType: 'number',
      },
      {
        formId: 4,
        inputName: 'SOYA SPROUTS 5 LBS',
        inputType: 'number',
      },
      {
        formId: 4,
        inputName: 'BASIL',
        inputType: 'number',
      },
      {
        formId: 4,
        inputName: 'CUCCUMBER',
        inputType: 'number',
      },
      {
        formId: 4,
        inputName: 'LIMES',
        inputType: 'number',
      },
      {
        formId: 4,
        inputName: 'NOTE',
        inputType: 'text',
      },
      // Form 5
      {
        formId: 5,
        inputName: 'DELIVERY DATE',
        inputType: 'date',
      },
      {
        formId: 5,
        inputName: 'BEANSPROUTS 10 LBS',
        inputType: 'number',
      },
      {
        formId: 5,
        inputName: 'BEANSPROUTS 5 LBS',
        inputType: 'number',
      },
      {
        formId: 5,
        inputName: 'BASIL',
        inputType: 'number',
      },
      {
        formId: 5,
        inputName: 'CUCCUMBER',
        inputType: 'number',
      },
      {
        formId: 5,
        inputName: 'LIMES',
        inputType: 'number',
      },
      {
        formId: 5,
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
