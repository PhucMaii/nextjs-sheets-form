import { PrismaClient } from '@prisma/client';
import { generateUsers } from './userData';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const users = await generateUsers();

  // for (const user of users) {
  //   const password = await hash(user.contactNumber, 12);
  //   await prisma.user.update({
  //     where: {
  //       clientId: user.clientId,
  //     },
  //     data: {
  //       password,
  //     },
  //   });
  // }

  await prisma.user.createMany({
    data: [
      ...users,
      // {
      //   clientId: '1',
      //   clientName: 'Admin 1',
      //   sheetName: 'Admin 1',
      //   deliveryAddress: '1-6420 Beresford Street, Burnaby, BC, V5E 1B3',
      //   contactNumber: '7787891060',
      //   categoryId: 1,
      //   password,
      //   role: 'admin',
      // },
    ],
  });

  await prisma.category.createMany({
    data: [
      // {
      //   name: 'Wholesale', // id: 1
      // },
      // {
      //   name: 'Wholesale - partner 1', // id: 2
      // },
      // {
      //   name: 'Wholesale - partner 2', // id: 3
      // },
      // {
      //   name: 'Retail/Restaurant', // id: 4
      // },
      // {
      //   name: 'Special price', // id: 5
      // },
      {
        name: 'Wholesale - partner 3' // id 6
      },
      {
        name: 'Wholesale - Terminal' // id 7
      },
    ],
  });

  await prisma.item.createMany({
    data: [
      // {
      //   name: 'BEANSPROUTS 10 LBS',
      //   categoryId: 1,
      //   price: 8.5,
      // },
      // {
      //   name: 'BEANSPROUTS 10 LBS',
      //   categoryId: 2,
      //   price: 7.5,
      // },
      // {
      //   name: 'BEANSPROUTS 10 LBS',
      //   categoryId: 3,
      //   price: 8.5,
      // },
      // {
      //   name: 'BEANSPROUTS 10 LBS',
      //   categoryId: 4,
      //   price: 9.5,
      // },
      // {
      //   name: 'BEANSPROUTS 10 LBS',
      //   categoryId: 5,
      //   price: 9.5,
      // },
      { 
        name: 'BEANSPROUTS 10 LBS',
        categoryId: 6,
        price: 7.5,
      },
      { 
        name: 'BEANSPROUTS 10 LBS',
        categoryId: 7,
        price: 7.75,
      },
      // {
      //   name: 'BEANSPROUTS 5 LBS',
      //   categoryId: 1,
      //   price: 4.25,
      // },
      // {
      //   name: 'BEANSPROUTS 5 LBS',
      //   categoryId: 2,
      //   price: 3.75,
      // },
      // {
      //   name: 'BEANSPROUTS 5 LBS',
      //   categoryId: 3,
      //   price: 4.25,
      // },
      // {
      //   name: 'BEANSPROUTS 5 LBS',
      //   categoryId: 4,
      //   price: 4.75,
      // },
      // {
      //   name: 'BEANSPROUTS 5 LBS',
      //   categoryId: 5,
      //   price: 4.75,
      // },
      { 
        name: 'BEANSPROUTS 5 LBS',
        categoryId: 6,
        price: 3.75,
      },
      { 
        name: 'BEANSPROUTS 5 LBS',
        categoryId: 7,
        price: 3.875,
      },
      // {
      //   name: 'BEANSPROUTS 24 x 1 LB',
      //   categoryId: 1,
      //   price: 26,
      // },
      {
        name: 'BEANSPROUTS 24 x 1 LB',
        categoryId: 5,
        price: 26,
      },
      {
        name: 'BEANSPROUTS 5 x 1 LB',
        categoryId: 7,
        price: 6.25,
      },
      // {
      //   name: 'SOYA SPROUTS 10 LBS',
      //   categoryId: 1,
      //   price: 8.5,
      // },
      // {
      //   name: 'SOYA SPROUTS 10 LBS',
      //   categoryId: 2,
      //   price: 7.5,
      // },
      // {
      //   name: 'SOYA SPROUTS 10 LBS',
      //   categoryId: 3,
      //   price: 8.5,
      // },
      // {
      //   name: 'SOYA SPROUTS 10 LBS',
      //   categoryId: 4,
      //   price: 9.5,
      // },
      {
        name: 'SOYA SPROUTS 10 LBS',
        categoryId: 6,
        price: 8.5,
      },
      {
        name: 'SOYA SPROUTS 10 LBS',
        categoryId: 7,
        price: 7.75,
      },
      // {
      //   name: 'SOYA SPROUTS 5 LBS',
      //   categoryId: 1,
      //   price: 4.25,
      // },
      // {
      //   name: 'SOYA SPROUTS 5 LBS',
      //   categoryId: 2,
      //   price: 3.75,
      // },
      // {
      //   name: 'SOYA SPROUTS 5 LBS',
      //   categoryId: 3,
      //   price: 4.25,
      // },
      // {
      //   name: 'SOYA SPROUTS 5 LBS',
      //   categoryId: 4,
      //   price: 4.75,
      // },
      {
        name: 'SOYA SPROUTS 5 LBS',
        categoryId: 6,
        price: 4.25,
      },
      {
        name: 'SOYA SPROUTS 5 LBS',
        categoryId: 7,
        price: 3.875,
      },
      // {
      //   name: 'SOYA SPROUTS 24 x 1 LB',
      //   categoryId: 1,
      //   price: 26,
      // },     
      {
        name: 'SOYA SPROUTS 24 x 1 LB',
        categoryId: 6,
        price: 26,
      },
      // {
      //   name: 'BASIL',
      //   categoryId: 4,
      //   price: 7.75,
      // },
      // {
      //   name: 'BASIL',
      //   categoryId: 5,
      //   price: 7.75,
      // },
      {
        name: 'JUMBO EGG',
        categoryId: 4,
        price: 48.5
      }
      // {
      //   name: 'CUCCUMBER',
      //   categoryId: 2,
      //   price: 1,
      // },
      // {
      //   name: 'CUCCUMBER',
      //   categoryId: 4,
      //   price: 1.25,
      // },
      // {
      //   name: 'CUCCUMBER',
      //   categoryId: 5,
      //   price: 1,
      // },
      // {
      //   name: 'LIMES',
      //   categoryId: 2,
      //   price: 30,
      // },
      // {
      //   name: 'LIMES',
      //   categoryId: 4,
      //   price: 40,
      // },
      // {
      //   name: 'LIMES',
      //   categoryId: 2,
      //   price: 35,
      // },
    ]});

  await prisma.form.createMany({
    data: [
      // {
      //   formName: 'Order Form',
      //   categoryId: 1,
      // },
      // {
      //   formName: 'Order Form',
      //   categoryId: 2,
      // },
      // {
      //   formName: 'Order Form',
      //   categoryId: 3,
      // },
      // {
      //   formName: 'Order Form',
      //   categoryId: 4,
      // },
      // {
      //   formName: 'Order Form',
      //   categoryId: 5,
      // },
      {
        formName: 'Order Form',
        categoryId: 6
      },
      {
        formName: 'Order Form',
        categoryId: 7
      }
    ],
  });

  await prisma.input.createMany({
    data: [
      // // Form 1
      // {
      //   formId: 1,
      //   inputName: 'DELIVERY DATE',
      //   inputType: 'date',
      // },
      // {
      //   formId: 1,
      //   inputName: 'BEANSPROUTS 10 LBS',
      //   inputType: 'number',
      // },
      // {
      //   formId: 1,
      //   inputName: 'BEANSPROUTS 5 LBS',
      //   inputType: 'number',
      // },
      // {
      //   formId: 1,
      //   inputName: 'BEANSPROUTS 24 x 1 LB',
      //   inputType: 'number',
      // },
      // {
      //   formId: 1,
      //   inputName: 'SOYA SPROUTS 10 LBS',
      //   inputType: 'number',
      // },
      // {
      //   formId: 1,
      //   inputName: 'SOYA SPROUTS 5 LBS',
      //   inputType: 'number',
      // },
      // {
      //   formId: 1,
      //   inputName: 'SOYA SPROUTS 24 x 1 LB',
      //   inputType: 'number',
      // },
      // {
      //   formId: 1,
      //   inputName: 'NOTE',
      //   inputType: 'text',
      // },
      // //  Form 2
      // {
      //   formId: 2,
      //   inputName: 'DELIVERY DATE',
      //   inputType: 'date',
      // },
      // {
      //   formId: 2,
      //   inputName: 'BEANSPROUTS 10 LBS',
      //   inputType: 'number',
      // },
      // {
      //   formId: 2,
      //   inputName: 'BEANSPROUTS 5 LBS',
      //   inputType: 'number',
      // },
      // {
      //   formId: 2,
      //   inputName: 'SOYA SPROUTS 10 LBS',
      //   inputType: 'number',
      // },
      // {
      //   formId: 2,
      //   inputName: 'SOYA SPROUTS 5 LBS',
      //   inputType: 'number',
      // },
      // {
      //   formId: 2,
      //   inputName: 'CUCCUMBER',
      //   inputType: 'number',
      // },
      // {
      //   formId: 2,
      //   inputName: 'LIMES',
      //   inputType: 'number',
      // },
      // {
      //   formId: 2,
      //   inputName: 'NOTE',
      //   inputType: 'text',
      // },
      // // Form 3
      // {
      //   formId: 3,
      //   inputName: 'DELIVERY DATE',
      //   inputType: 'date',
      // },
      // {
      //   formId: 3,
      //   inputName: 'BEANSPROUTS 10 LBS',
      //   inputType: 'number',
      // },
      // {
      //   formId: 3,
      //   inputName: 'BEANSPROUTS 5 LBS',
      //   inputType: 'number',
      // },
      // {
      //   formId: 3,
      //   inputName: 'SOYA SPROUTS 10 LBS',
      //   inputType: 'number',
      // },
      // {
      //   formId: 3,
      //   inputName: 'SOYA SPROUTS 5 LBS',
      //   inputType: 'number',
      // },
      // {
      //   formId: 3,
      //   inputName: 'NOTE',
      //   inputType: 'text',
      // },
      // // Form 4
      // {
      //   formId: 4,
      //   inputName: 'DELIVERY DATE',
      //   inputType: 'date',
      // },
      // {
      //   formId: 4,
      //   inputName: 'BEANSPROUTS 10 LBS',
      //   inputType: 'number',
      // },
      // {
      //   formId: 4,
      //   inputName: 'BEANSPROUTS 5 LBS',
      //   inputType: 'number',
      // },
      // {
      //   formId: 4,
      //   inputName: 'SOYA SPROUTS 10 LBS',
      //   inputType: 'number',
      // },
      // {
      //   formId: 4,
      //   inputName: 'SOYA SPROUTS 5 LBS',
      //   inputType: 'number',
      // },
      // {
      //   formId: 4,
      //   inputName: 'BASIL',
      //   inputType: 'number',
      // },
      // {
      //   formId: 4,
      //   inputName: 'JUMBO EGGS',
      //   inputType: 'number',
      // },
      // {
      //   formId: 4,
      //   inputName: 'CUCCUMBER',
      //   inputType: 'number',
      // },
      // {
      //   formId: 4,
      //   inputName: 'LIMES',
      //   inputType: 'number',
      // },
      // {
      //   formId: 4,
      //   inputName: 'NOTE',
      //   inputType: 'text',
      // },
      // // Form 5
      // {
      //   formId: 5,
      //   inputName: 'DELIVERY DATE',
      //   inputType: 'date',
      // },
      // {
      //   formId: 5,
      //   inputName: 'BEANSPROUTS 10 LBS',
      //   inputType: 'number',
      // },
      // {
      //   formId: 5,
      //   inputName: 'BEANSPROUTS 5 LBS',
      //   inputType: 'number',
      // },
      // {
      //   formId: 5,
      //   inputName: 'BASIL',
      //   inputType: 'number',
      // },
      // {
      //   formId: 5,
      //   inputName: 'CUCCUMBER',
      //   inputType: 'number',
      // },
      // {
      //   formId: 5,
      //   inputName: 'LIMES',
      //   inputType: 'number',
      // },
      // {
      //   formId: 5,
      //   inputName: 'NOTE',
      //   inputType: 'text',
      // },
      // Form 6
      {
        formId: 6,
        inputName: 'DELIVERY DATE',
        inputType: 'date',
      },
      {
        formId: 6,
        inputName: 'BEANSPROUTS 10 LBS',
        inputType: 'number',
      },
      {
        formId: 6,
        inputName: 'BEANSPROUTS 5 LBS',
        inputType: 'number',
      },
      {
        formId: 6,
        inputName: 'SOYA SPROUTS 10 LBS',
        inputType: 'number',
      },
      {
        formId: 6,
        inputName: 'SOYA SPROUTS 5 LBS',
        inputType: 'number',
      },
      {
        formId: 6,
        inputName: 'SOYA SPROUTS 24 x 1 LB',
        inputType: 'number'
      },
      {
        formId: 6,
        inputName: 'NOTE',
        inputType: 'text',
      },
      // Form 7
      {
        formId: 7,
        inputName: 'DELIVERY DATE',
        inputType: 'date',
      },
      {
        formId: 7,
        inputName: 'BEANSPROUTS 10 LBS',
        inputType: 'number',
      },
      {
        formId: 7,
        inputName: 'BEANSPROUTS 5 LBS',
        inputType: 'number',
      },
      {
        formId: 7,
        inputName: 'BEANSPROUTS 5 x 1 LB',
        inputType: 'number',
      },
      {
        formId: 7,
        inputName: 'SOYA SPROUTS 10 LBS',
        inputType: 'number',
      },
      {
        formId: 7,
        inputName: 'SOYA SPROUTS 5 LBS',
        inputType: 'number',
      },
      {
        formId: 7,
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
