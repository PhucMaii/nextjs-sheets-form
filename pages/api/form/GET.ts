import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

export const GETMethod = async (
  req: NextApiRequest,
  res: NextApiResponse,
  prisma: PrismaClient,
) => {
  try {
    const session: any = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ error: 'You are not authenticated' });
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        id: Number(session.user.id),
      },
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'User Not Found in DB' });
    }

    const formData = await prisma.form.findFirst({
      where: {
        categoryId: existingUser.categoryId,
      },
      include: {
        inputs: true,
      },
    });

    return res.status(200).json({
      data: formData,
      message: 'Fetch form successfully',
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send('There was an error ' + error);
  }
};
