import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await hash('test', 12);
  const user = await prisma.user.create({
    data: {
      clientId: '00211',
      sheetName: 'Test User',
      password,
    } as any,
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
