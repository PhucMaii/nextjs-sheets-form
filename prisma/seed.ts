import { PrismaClient } from '@prisma/client';
// import { generateUsers } from './userData';
// import { hash } from 'bcrypt';
// import { hash } from 'bcrypt';
// import { items } from './itemData';
// import { inputs } from './inputFieldData';

const prisma = new PrismaClient();

async function main() {
  // Remove subcategory for user
  await prisma.user.updateMany({
    data: {
      subCategoryId: null
    }
  });

  // Remove subcategory for items
  await prisma.item.updateMany({
    data: {
      subCategoryId: null
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
