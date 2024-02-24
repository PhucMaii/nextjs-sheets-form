import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

interface RequestQuery {
  id?: string;
}

export const GETMethod = async (
  req: NextApiRequest,
  res: NextApiResponse,
  prisma: PrismaClient,
) => {
  try {
    const { id }: RequestQuery = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Missing form id' });
    }

    const session: any = await getServerSession(req, res, authOptions);
    const existingForm = await prisma.form.findUnique({
      where: {
        formId: Number(id),
      },
    });

    if (parseInt(session?.user.id) !== existingForm?.userId) {
      return res.status(404).json({ error: 'You are not authorized' });
    }

    const updateLastOpened = await prisma.form.update({
      where: {
        formId: Number(id),
      },
      data: {
        lastOpened: new Date(),
      },
    });

    const data = await prisma.form.findUnique({
      where: {
        formId: Number(id),
      },
      include: {
        inputs: true
      } as any
    });
    console.log(data, 'data');

    if (data && updateLastOpened) {
      return res.status(200).json({
        data,
        message: `Fetch Form with id ${id} Successfully`,
      });
    } else {
      return res.status(500).send('Failed to fetch or update form data');
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send('There was an error ' + error);
  }
};
