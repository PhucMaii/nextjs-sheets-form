import { NextApiRequest, NextApiResponse } from 'next';
import withAdminAuthGuard from '../../utils/withAdminAuthGuard';
import { PrismaClient } from '@prisma/client';
import { Order } from '@/app/admin/orders/page';
import { ORDER_STATUS } from '@/app/utils/enum';
import _ from 'lodash';
import { groupBy } from '@/app/utils/array';
import { IItem } from '@/app/utils/type';
import { checkIsKorean } from '../../utils/korean';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '8mb', // Set desired value here
    },
  },
};

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
    // const buffers = [];
    //   for await (const chunk of req) {
    //     buffers.push(chunk);
    //   }
    //   const compressedBuffer = Buffer.concat(buffers);
    //   const decompressedData = zlib.inflateSync(compressedBuffer).toString();
    //   const parsedData = JSON.parse(decompressedData);
    //   const { day, orderList, userRoute } = parsedData as IBody;

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

    // console.log(userRoute, 'userRoute');
    /**
     * User Route: {
     * '56': [1, 2, 3],
     * '57': [4, 5, 6],
     * etc
     * }
     */
    // console.log(dayRoutes, 'dayRoutes');

    /**
     * Day Routes: [
     * {
     * id: 56, other route info
     * },
     * {
     * id: 57
     * },
     * etc
     * ]
     */

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

      // Group order by route id
    const orderByRoutes = _.orderBy(clientRoutes, ['routeId'], ['asc']);

    // Arrange as user route positions in pre order
    const sortedOrderByRoutes = [];

    // Track order from start to end, since order has same routeId will stand together, so we can use this to sort
    let trackOrderByRoutesIndex = 0;
    let currentRouteId = orderByRoutes[0].routeId;
    let currentRouteOrders: any = []; // to get sort

    while (trackOrderByRoutesIndex <= orderByRoutes.length) {
      if (!orderByRoutes[trackOrderByRoutesIndex]?.routeId) {
        // Reach the end of the orderByRoutes - Finalize the currentRouteOrders
        const sortedUserIds = userRoute[currentRouteId];
        currentRouteOrders.sort((orderA: Order, orderB: Order) => {
          return (
            sortedUserIds.indexOf(orderA.userId) -
            sortedUserIds.indexOf(orderB.userId)
          );
        });
        sortedOrderByRoutes.push(...currentRouteOrders);
        
        trackOrderByRoutesIndex++;
        continue;
      }
      // If current order route id is same as the previous order -> jump to next order
      if (orderByRoutes[trackOrderByRoutesIndex].routeId === currentRouteId) {
        currentRouteOrders.push(orderByRoutes[trackOrderByRoutesIndex]);
      } else {
        // If current order route id is different from the previous order
        // Means we have reached the end of the current route
        // Sort the current route orders
        const sortedUserIds = userRoute[currentRouteId];
        currentRouteOrders.sort((orderA: Order, orderB: Order) => {
          return (
            sortedUserIds.indexOf(orderA.userId) -
            sortedUserIds.indexOf(orderB.userId)
          );
        });
        sortedOrderByRoutes.push(...currentRouteOrders);
        
        // Initialize for new route
        currentRouteOrders = [orderByRoutes[trackOrderByRoutesIndex]];
        currentRouteId = orderByRoutes[trackOrderByRoutesIndex]?.routeId;
      }

      trackOrderByRoutesIndex++;
    }
    // for (const route of dayRoutes) {
    //   const sortedUserIds = userRoute[route.id];
    //   // console.log(sortedUserIds, 'sortedUserIds');

    //   if (!sortedUserIds) {
    //     continue;
    //   }

    //   // Create a map for quick lookup of index positions
    //   const sortedUserIdsMap: any = new Map(
    //     sortedUserIds.map((id: any, index: number) => [id, index]),
    //   );

    //   const currentRouteOrders = orderByRoutes.filter(
    //     (order: Order) => order.routeId === route.id,
    //   );

    //   currentRouteOrders.sort((orderA: Order, orderB: Order) => {
    //     return (
    //       sortedUserIdsMap.get(orderA.userId) -
    //       sortedUserIdsMap.get(orderB.userId)
    //     );
    //   });

    //   sortedOrderByRoutes.push(...currentRouteOrders);
    // }

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
