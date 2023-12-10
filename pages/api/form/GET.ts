import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

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
      return res.status(400).send('Missing id');
    }
    const updateLastOpened = await prisma.form.update({
      where: {
        form_id: Number(id),
      },
      data: {
        lastOpened: new Date(),
      },
    });
    const data = await prisma.form.findUnique({
      where: {
        form_id: Number(id),
      },
      include: {
        positions: {
          include: {
            inputs: true,
          },
        },
      },
    });
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
