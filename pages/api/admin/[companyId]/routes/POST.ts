import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/client';

interface BodyType {
  day: string;
  driverId: number;
  name: string;
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { day, driverId, name }: BodyType = req.body;

    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({
        message: 'Company ID is required',
      });
    }

    const existedRoute = await prisma.route.findFirst({
      where: {
        day,
        employeeId: driverId,
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
        employeeId: driverId,
        name,
        companyId: Number(companyId),
      },
    });

    // const formattedUser = clientList.map((client: UserType) => {
    //   return { user: { connect: { id: client.id } } };
    // });

    const updatedRoute = await prisma.route.findUnique({
      where: {
        id: newRoute.id,
      },
      include: {
        employee: true,
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
