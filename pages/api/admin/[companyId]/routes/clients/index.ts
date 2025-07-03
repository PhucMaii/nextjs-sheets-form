import { UserRoute } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/client';

interface IQuery {
  day?: string;
  companyId?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    if (req.method !== 'GET') {
      return res.status(404).json({
        error: 'Your method is not supported'});
    }

    const { day, companyId }: IQuery = req.query;

    if (!day || !companyId) {
      return res.status(404).json({
        error: 'Day and Company ID is not provided'});
    }

    const routeList = await prisma.route.findMany({
      where: {
        day,
        companyId: Number(companyId)},
      include: {
        clients: true}});

    const scheduleOrders = await prisma.scheduleOrders.findMany({
      where: {
        day,
        companyId: Number(companyId)},
      include: {
        user: {
          include: {
            routes: true}},
        positionIndex: true},
      orderBy: {
        positionIndex: {
          index: 'asc'}}});

    const unsortedRouteListWithUserId = routeList.reduce(
      (acc: any, route: any) => {
        const routeKey = route.id;

        const clientIds = route.clients?.map((client: UserRoute) => {
          return client.userId;
        });
        acc[routeKey] = clientIds;

        if (!acc[routeKey]) {
          acc[routeKey] = [];
        }
        return acc;
      },
      {},
    );

    const sortedUserIds: any = {};
    const routeListInTargetDay = Object.keys(unsortedRouteListWithUserId);

    // Loop run O(n ^ 3) - Need to optimize
    for (const scheduleOrder of scheduleOrders) {
      // Find the right route of the schedule order owner
      const clientRoute: any = scheduleOrder.user.routes.find(
        (route: UserRoute) => {
          const targetRoute = routeListInTargetDay.find((id: string) => {
            return route.routeId === Number(id);
          });

          // if route id is included in target route list, then return route
          if (targetRoute) {
            return route;
          }
        },
      );

      if (!clientRoute) {
        continue;
      }

      if (!sortedUserIds[clientRoute.routeId]) {
        sortedUserIds[clientRoute.routeId] = [scheduleOrder.userId];
      } else {
        sortedUserIds[clientRoute.routeId] = [
          ...sortedUserIds[clientRoute.routeId],
          scheduleOrder.userId,
        ];
      }
    }

    return res.status(200).json({
      data: sortedUserIds,
      message: 'Fetch Clients Based On Routes Successfully'});
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error});
  }
}
