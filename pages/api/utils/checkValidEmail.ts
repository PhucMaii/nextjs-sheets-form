import { PrismaClient } from '@prisma/client';

export default async function checkValidEmail(
  prisma: PrismaClient,
  email: string,
) {
  try {
    const existingEmail = await prisma.user.findMany({
      where: {
        email,
      },
    });
    console.log({ existingEmail, email }, 'Existing Email');
    return existingEmail.length === 0;
  } catch (error) {
    console.log('Error Occurred In Checking Valid Email', error);
  }
}
