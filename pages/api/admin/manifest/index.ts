import { NextApiRequest, NextApiResponse } from 'next';
import withAdminAuthGuard from '../../utils/withAdminAuthGuard';
import { PrismaClient } from '@prisma/client';
import { Order } from '@/app/admin/orders/page';
import { ORDER_STATUS } from '@/app/utils/enum';
import _ from 'lodash';
import { groupBy } from '@/app/utils/array';
import { IItem } from '@/app/utils/type';
import { checkIsKorean } from '../../utils/korean';

interface IBody {
  day: string;
  orderList: Order[];
  userRoute: any;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const prisma = new PrismaClient();

    if (req.method !== 'POST') {
      return res.status(404).json({
        error: 'Your method is not supported',
      });
    }

    const { day, orderList, userRoute } = req.body as IBody;

    // if (!userRoute) {
    //     return res.status(404).json({
    //         error: 'User route is not provided',
    //     });
    // }

    const dayRoutes = await prisma.route.findMany({
      where: {
        day,
      },
    });

    const nonVoidOrders = orderList.filter(
      (order: Order) => order.status !== ORDER_STATUS.VOID,
    );

    // Create Route Map
    const routeMap = new Map(dayRoutes.map((route: any) => [route.id, route]));
    // console.log(routeMap, 'routeMap');

    const clientRoutes = nonVoidOrders
      .map((order: Order) => {
        // Check if user has the related route
        const relatedRoute = order.user?.routes?.find((route: any) =>
          routeMap.has(route.routeId),
        );
        // console.log(relatedRoute, 'relatedRoute');
        const userRelatedRoute = { ...order, routeId: relatedRoute?.routeId };
        return userRelatedRoute;
      })
      .filter((order: Order) => order.routeId);

    const orderByRoutes = _.orderBy(clientRoutes, ['routeId'], ['asc']);

    // console.log(orderByRoutes, 'orderByRoutes');
    // Arrange as user route
    const sortedOrderByRoutes = [];
    for (const route of dayRoutes) {
      const sortedUserIds = userRoute[route.id];
      // console.log(sortedUserIds, 'sortedUserIds');

      if (!sortedUserIds) {
        continue;
      }

      // Create a map for qyuick lookup of index positions
      const sortedUserIdsMap: any = new Map(
        sortedUserIds.map((id: any, index: number) => [id, index]),
      );
      // console.log(sortedUserIdsMap, 'sortedUserIdsMap');

      const currentRouteOrders = orderByRoutes.filter(
        (order: Order) => order.routeId === route.id,
      );

      currentRouteOrders.sort((orderA: Order, orderB: Order) => {
        return (
          sortedUserIdsMap.get(orderA.userId) -
          sortedUserIdsMap.get(orderB.userId)
        );
      });
      // console.log(orderByRoutes.length, 'orderByRoutes.length');

      // console.log(orderByRoutes, 'orderByRoutes');

      sortedOrderByRoutes.push(...currentRouteOrders);
    }

    // console.log(sortedOrderByRoutes, 'sortedOrderByRoutes');

    // Item Manifest
    const items = sortedOrderByRoutes.map((order: Order) => {
      return order?.items.map((item: any) => {
        return {
          ...item,
          routeId: order.routeId,
          client: order.clientName,
          user: order.user,
        };
      });
    });

    if (!items[0]) {
      return res.status(404).json({
        error: 'No items found',
      });
    }

    // Group items by route
    const groupItemRoutes: any = groupBy(
      items.flat(),
      ({ routeId }: any) => routeId,
    );

    const itemManifest: any = {};
    for (const itemRoute in groupItemRoutes) {
      const manifestItem = groupItemRoutes[itemRoute].reduce(
        (acc: any, item: IItem) => {
          const { name } = item;

          let itemKey = name;

          if (checkIsKorean(itemKey.split(' - ')[0])) {
            itemKey = itemKey.split(' - ')[1];
          } else {
            itemKey = itemKey.includes('KONGNAMUL')
              ? itemKey.split(' - ')[1]
              : itemKey;
          }
          
          if (!acc[itemKey]) {
            acc[itemKey] = 0;
          }

          acc[itemKey] = acc[itemKey] + item.quantity;
          return acc;
        },
        {},
      );

      const manifestDetail = groupItemRoutes[itemRoute].reduce(
        (acc: any, item: IItem, index: number) => {
          const { user, quantity } = item;
          if (!user) {
            return acc;
          }

          let itemKey = item.name;

          if (checkIsKorean(itemKey.split(' - ')[0])) {
            itemKey = itemKey.split(' - ')[1];
          } else {
            itemKey = itemKey.includes('KONGNAMUL')
              ? itemKey.split(' - ')[1]
              : itemKey;
          }

          if (user.clientId === '00303') {
            console.log({itemKey, name: item.name}, 'itemKey');
          }
          // Beginning of new customer
          if (
            index === 0 ||
            groupItemRoutes[itemRoute][index - 1].user.id !== user.id
          ) {
            const newUserManifest = {
              user,
              [itemKey]: quantity,
            };
            acc.push(newUserManifest);
            return acc;
          }

          const currentUserManifest = acc[acc.length - 1];
          const updatedUserManifest = {
            ...currentUserManifest,
            [itemKey]: quantity,
          };
          acc[acc.length - 1] = updatedUserManifest;
          return acc;
        },
        [],
      );

      itemManifest[itemRoute] = {
        details: manifestDetail,
        summary: manifestItem,
      };
    }

    // console.log('Manifest: ', {orderPrint: sortedOrderByRoutes, itemmani});

    return res.status(200).json({
      data: { orderPrint: sortedOrderByRoutes, itemManifest },
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
};

export default withAdminAuthGuard(handler);
