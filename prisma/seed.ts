import { PrismaClient } from '@prisma/client';
// import { generateUsers } from './userData';
// import { hash } from 'bcrypt';
// import { hash } from 'bcrypt';
// import { items } from './itemData';
// import { inputs } from './inputFieldData';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.updateMany({
    where: {
      clientId: {
        in: ['00123', '00157', '00240'],
      },
    },
    data: {
      email: 'sweetfhui@gmail.com',
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
