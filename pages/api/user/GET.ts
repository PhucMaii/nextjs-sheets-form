import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const prisma = new PrismaClient();
    const { clientId } = req.query as any;

    const existingUser = await prisma.user.findUnique({
      where: {
        clientId,
      },
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'User Not Found in DB' });
    }

    return res.status(200).json({
      data: existingUser,
      message: 'Fetch User Successfully',
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: 'Internal Server Occur in GET USER request',
    });
  }
};

export default GET; // Security Risk
