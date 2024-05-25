import { UserType } from '@/app/utils/type';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface BodyType {
  day: string;
  driverId: number;
  name: string;
  clientList: UserType[];
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { day, driverId, name, clientList }: BodyType = req.body;

    const existedRoute = await prisma.route.findFirst({
      where: {
        day,
        driverId,
      },
    });

    if (existedRoute) {
      return res.status(500).json({
        error: `Driver Or Route Name Already Existed For ${day}`,
      });
    }

    const newRoute = await prisma.route.create({
      data: {
        day,
        driverId,
        name,
      },
    });

    const formattedUser = clientList.map((client: UserType) => {
      return { user: { connect: { id: client.id } } };
    });

    const updatedRoute = await prisma.route.update({
      where: {
        id: newRoute.id,
      },
      data: {
        clients: {
          create: formattedUser,
        },
      },
      include: {
        driver: true,
        clients: {
          include: {
            user: true,
          },
        },
      },
    });

    return res.status(201).json({
      data: updatedRoute,
      message: 'Create Route Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
