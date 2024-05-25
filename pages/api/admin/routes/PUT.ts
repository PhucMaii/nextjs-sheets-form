import { UserType } from '@/app/utils/type';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface BodyTypes {
  routeId: number;
  name?: string;
  day?: string;
  driverId?: number;
  clients?: UserType[];
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { routeId, day, name, driverId, clients }: BodyTypes = req.body;

    const updateOptions: any = {};

    if (day) {
        updateOptions.day = day;
    }

    if (name) {
        updateOptions.name = name;
    }

    if (driverId) {
        updateOptions.driverId = driverId;
    }

    const existingRoute = await prisma.route.findUnique({
      where: {
        id: routeId,
      },
    });

    if (!existingRoute) {
      return res.status(404).json({
        error: 'Route Id Not Found',
      });
    }

    // check if any updated with day or driverId, then check before update
    if (day || driverId) {
      const checkIsRouteNotValid = await prisma.route.findFirst({
        where: {
          day,
          driverId,
        },
      });

      if (checkIsRouteNotValid) {
        return res.status(500).json({
          error: 'Driver Existed In This Route Already',
        });
      }
    }

    const updatedRoute = await prisma.route.update({
      where: {
        id: routeId,
      },
      data: updateOptions,
    });

    if (clients) {
        for (const client of clients) {
            // check if client id exist in user route
            const existingUserRoute = await prisma.userRoute.findUnique({
                where: {
                    userId_routeId: {
                        userId: client.id,
                        routeId
                    }
                }
            });

            if (existingUserRoute) {
                continue;
            }

            await prisma.userRoute.create({
                data: {
                    userId: client.id,
                    routeId
                }
            })
        }
    }

    return res.status(200).json({
      data: updatedRoute,
      message: 'Route Updated Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
