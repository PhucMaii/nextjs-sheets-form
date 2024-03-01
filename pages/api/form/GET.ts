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
      return res.status(400).json({ error: 'Missing form id' });
    }

    const data = await prisma.form.findUnique({
      where: {
        formId: Number(id),
      },
      include: {
        inputs: true,
      },
    });

    if (data) {
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
