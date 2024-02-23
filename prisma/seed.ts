import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await hash('test', 12);
  const user = await prisma.user.create({
    data: {
      clientId: '00001',
      email: 'test@test.com',
      sheetName: 'Test User',
      password,
    },
  });
  console.log({ user });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.log(error);
    await prisma.$disconnect();
    process.exit(1);
  });
