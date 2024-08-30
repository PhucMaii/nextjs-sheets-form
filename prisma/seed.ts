import { PrismaClient } from '@prisma/client';
// import { generateUsers } from './userData';
// import { hash } from 'bcrypt';
// import { hash } from 'bcrypt';
// import { items } from './itemData';
// import { inputs } from './inputFieldData';

const prisma = new PrismaClient();

async function main() {
  // Soya 10 LB
  await prisma.item.updateMany({
    where: {
      name: {
        in: ['BEAN 10LB', 'BEAN-10LB', 'BEANS 10LBS', 'BEANS 10 LB'],
      },
    },
    data: {
      name: 'BEAN 10 LB',
    },
  });

  // Soya 5 LB
  await prisma.item.updateMany({
    where: {
      name: {
        in: ['BEANSPROUTS 24 x 1 LB', 'BEAN 24X1'],
      },
    },
    data: {
      name: 'BEAN 24X1 LB',
    },
  });

  // Soya 24X1 LB
  await prisma.item.updateMany({
    where: {
      name: {
        in: ['BEANSPROUTS 5 X 1 LB'],
      },
    },
    data: {
      name: 'BEAN 5X1 LB',
    },
  });

  await prisma.item.updateMany({
    where: {
      name: 'BEANSPROUTS 10 X 8 OZ',
    },
    data: {
      name: 'BEAN 10X8 OZ',
    },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.log(error);
    await prisma.$disconnect();
    // process.exit(1);
  });
