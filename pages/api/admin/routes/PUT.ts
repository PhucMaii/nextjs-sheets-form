import { UserType } from '@/app/utils/type';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface BodyTypes {
  routeId: number;
  name?: string;
  day?: string;
  driverId?: number;
  updatedClients?: UserType[];
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { routeId, day, name, driverId, updatedClients }: BodyTypes =
      req.body;

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
      include: {
        clients: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!existingRoute) {
      return res.status(404).json({
        error: 'Route Id Not Found',
      });
    }

    // check if any updated with day or driverId, then check before update
    if (day || driverId) {
      console.log({ day, driverId });
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

    let baseClientList = existingRoute.clients.map((userRoute: any) => {
      return userRoute.user;
    });

    if (updatedClients) {
      for (const client of updatedClients) {
        // check if client id exist in user route
        const existingUserRoute = baseClientList.find(
          (targetClient: UserType) => client.id === targetClient.id,
        );

        if (existingUserRoute) {
          // pop item off to track
          baseClientList = baseClientList.filter((targetClient: UserType) => {
            return targetClient.id !== client.id;
          });
          continue;
        }

        await prisma.userRoute.create({
          data: {
            userId: client.id,
            routeId,
          },
        });
      }
    }

    // Remove client schedule orders as admin wants
    if (baseClientList.length > 0) {
      const removedIds = baseClientList.map((client: UserType) => {
        return client.id;
      });

      await prisma.userRoute.deleteMany({
        where: {
          userId: {
            in: removedIds,
          },
        },
      });
    }

    const updatedRoute = await prisma.route.update({
      where: {
        id: routeId,
      },
      data: updateOptions,
      include: {
        driver: true,
        clients: {
          include: {
            user: true,
          },
        },
      },
    });

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
