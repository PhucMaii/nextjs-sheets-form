import { PrismaClient } from '@prisma/client';
// import { generateUsers } from './userData';
// import { hash } from 'bcrypt';
// import { hash } from 'bcrypt';
// import { items } from './itemData';
// import { inputs } from './inputFieldData';

const prisma = new PrismaClient();

async function main() {
  // const users = await generateUsers();
  // const adminPassword = await hash('admin123', 12);
  // await prisma.user.createMany({
  //   data: [
  //     ...users,
  //     // {
  //     //   clientId: '1',
  //     //   clientName: 'Admin 1',
  //     //   sheetName: 'Admin 1',
  //     //   deliveryAddress: '1-6420 Beresford Street, Burnaby, BC, V5E 1B3',
  //     //   contactNumber: '7787891060',
  //     //   categoryId: 1,
  //     //   password: adminPassword,
  //     //   role: 'admin',
  //     // },
  //   ],
  // });
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
  // await prisma.category.createMany({
  //   data: [
  //     {
  //       name: 'Wholesale', // id: 1
  //     },
  //     {
  //       name: 'Wholesale - Terminal', // id: 2
  //     },
  //     {
  //       name: 'Wholesale - Consumer Produce', // id: 3
  //     },
  //     {
  //       name: 'Wholesale - Dafa Natural Foods', // id: 4
  //     },
  //     {
  //       name: 'Wholesale - Super Save Produce', // id: 5
  //     },
  //     {
  //       name: 'Wholesale - Standard Trading', // id 6
  //     },
  //     {
  //       name: 'Wholesale - Freeman', // id 7
  //     },
  //     {
  //       name: 'Wholesale - Doli', // id 8
  //     },
  //     {
  //       name: 'Special Client - MIXED', // id 9
  //     },
  //     {
  //       name: 'Retail - B.K', // id 10
  //     },
  //     {
  //       name: 'Retail - P.P', // id 11
  //     },
  //     {
  //       name: 'Retail - Thai Basil', // id 12
  //     },
  //   ],
  // });
  // await prisma.item.createMany({
  //   data: [...items],
  // });
  // await prisma.form.createMany({
  //   data: [
  //     {
  //       formName: 'Order Form',
  //       categoryId: 1,
  //     },
  //     {
  //       formName: 'Order Form',
  //       categoryId: 2,
  //     },
  //     {
  //       formName: 'Order Form',
  //       categoryId: 3,
  //     },
  //     {
  //       formName: 'Order Form',
  //       categoryId: 4,
  //     },
  //     {
  //       formName: 'Order Form',
  //       categoryId: 5,
  //     },
  //     {
  //       formName: 'Order Form',
  //       categoryId: 6,
  //     },
  //     {
  //       formName: 'Order Form',
  //       categoryId: 7,
  //     },
  //     {
  //       formName: 'Order Form',
  //       categoryId: 8,
  //     },
  //     {
  //       formName: 'Order Form',
  //       categoryId: 9,
  //     },
  //     {
  //       formName: 'Order Form',
  //       categoryId: 10,
  //     },
  //     {
  //       formName: 'Order Form',
  //       categoryId: 11,
  //     },
  //     {
  //       formName: 'Order Form',
  //       categoryId: 12,
  //     },
  //   ],
  // });
  // await prisma.input.createMany({
  //   data: [...inputs],
  // });
  // const driverPassword = await hash('driver123', 12);
  // const driverList = [
  //   {
  //     name: 'NATHAN',
  //     password: driverPassword
  //   },
  //   {
  //     name: 'NGUYEN',
  //     password: driverPassword
  //   },
  //   {
  //     name: 'PETER',
  //     password: driverPassword
  //   },
  //   {
  //     name: 'TONY',
  //     password: driverPassword
  //   },
  //   {
  //     name: 'BAO BAO',
  //     password: driverPassword
  //   },
  // ];
  // await prisma.driver.createMany({
  //   data: driverList
  // })
  // const routes = [
  //   {
  //     day: 'Sunday',
  //     driverId:
  //   }
  // ]
  // await prisma.route.createMany({
  //   data: [
  //   ]
  // })

  await prisma.item.updateMany({
    where: {
      name: 'BEAN 10'
    },
    data: {
      name: 'BEAN 10 LB'
    }
  })

  await prisma.item.updateMany({
    where: {
      name: 'BEAN 5LB'
    },
    data: {
      name: 'BEAN 5 LB'
    }
  })

  await prisma.orderedItems.updateMany({
    where: {
      name: {
        in: ["BEANSPROUTS 5 LBS", "BEAN 5 LBS"]
      }
    },
    data: {
      name: 'BEAN 5 LB'
    }
  })

  await prisma.orderedItems.updateMany({
    where: {
      name: {
        in: ["BEANSPROUTS 10 LBS", "BEAN 10 LBS"]
      }
    },
    data: {
      name: 'BEAN 10 LB'
    }
  })
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.log(error);
    await prisma.$disconnect();
    // process.exit(1);
  });
