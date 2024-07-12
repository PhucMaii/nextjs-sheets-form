import { Order } from '@/app/admin/orders/page';
import { groupBy } from '@/app/utils/array';
import { API_URL, ORDER_STATUS } from '@/app/utils/enum';
import { IItem, IRoutes } from '@/app/utils/type';
import { UserRoute } from '@prisma/client';
import { useEffect, useMemo, useState } from 'react';
import _ from 'lodash';
import useSWR from 'swr';
import { days } from '@/app/lib/constant';

const useManifest = (
  orderList: Order[],
  routes: IRoutes[],
  selectedRoutes: IRoutes[],
  date: string,
) => {
  const [orderPrint, setOrderPrint] = useState<any>([]);
  const [itemManifest, setItemManifest] = useState<any>({});

  const formattedDate = new Date(date);
  const givenDay = days[formattedDate.getDay()];
  const { data: userRoute } = useSWR(
    `${API_URL.ROUTES}/clients?day=${givenDay}`,
  );

  // Filter void orders and sort it by user route
  const nonVoidOrders = useMemo(() => {
    if (!userRoute?.data) {
      return [];
    }

    const filteredVoidOrders = orderList.filter(
      (order: Order) => order.status !== ORDER_STATUS.VOID,
    );

    return filteredVoidOrders;
  }, [orderList, userRoute]);

  useEffect(() => {
    if (routes.length > 0) {
      getClientRoutes();
    }
  }, [orderList, routes, selectedRoutes]);

  useEffect(() => {
    if (orderPrint.length > 0) {
      getItemsManifest();
    }
  }, [orderPrint]);

  const getClientRoutes = (): any => {
    const selectedRoutesMap = new Map(
      selectedRoutes.map((route: IRoutes) => [route.id, route]),
    );
    // Attach route id in order
    const clientRoutes = nonVoidOrders.map((order: Order): any => {
      // Filter user routes to get only routes related to current given list of routes
      const relatedRoutes = order.user?.routes
        ?.filter((route: UserRoute): any => {
          // const relatedRoute = selectedRoutes.find(
          //   (baseRoute: IRoutes) => baseRoute.id === route.routeId,
          // );
          // return !!relatedRoute;
          return selectedRoutesMap.has(route.routeId);
        })
        .map((route: UserRoute): any => ({
          // map to attach order information
          routeId: route.routeId,
          ...order,
        }));
      return relatedRoutes;
    });

    const orderByRoutes = _.orderBy(clientRoutes.flat(), ['routeId'], ['asc']);

    // Arrange as user route
    const sortedOrderByRoutes = [];
    for (const selectedRoute of selectedRoutes) {
      const sortedUserIds = userRoute.data[selectedRoute.id];
      const routeOrders = orderByRoutes.filter((order: Order) => {
        return order.routeId === selectedRoute.id;
      });

      // Create a map for quick lookup of index positions
      const orderIdIndexMap: any = new Map(
        sortedUserIds.map((id: string, index: number) => [id, index]),
      );
      // Sort users based on the index positions in index map
      routeOrders.sort(
        (orderA: Order, orderB: Order) =>
          orderIdIndexMap.get(orderA.userId) -
          orderIdIndexMap.get(orderB.userId),
      );
      sortedOrderByRoutes.push(...routeOrders);
    }

    setOrderPrint(sortedOrderByRoutes);
  };

  const getItemsManifest = () => {
    const items = orderPrint.map((order: Order) => {
      return order?.items.map((item: any) => {
        if (item.name.includes('BEAN')) {
          return {
            ...item,
            subCategory: order.subCategory,
            routeId: order.routeId,
            client: order.clientName,
            user: order.user,
          };
        } else {
          return {
            ...item,
            routeId: order.routeId,
            client: order.clientName,
            user: order.user,
          };
        }
      });
    });

    // If order print is undefined
    if (!items[0]) {
      return;
    }

    // Group items by route
    const groupItemRoutes: any = groupBy(
      items.flat(),
      ({ routeId }: any) => routeId,
    );

    for (const itemRoute in groupItemRoutes) {
      const manifestItem = groupItemRoutes[itemRoute].reduce(
        (acc: any, item: IItem) => {
          const { name, subCategory } = item;

          let itemKey = name;
          if (subCategory) {
            itemKey = `${name}-${subCategory.name}`;
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
          const { user, name, quantity } = item;
          if (!user) {
            return acc;
          }

          const { subCategory } = item;
          let itemKey = name;
          if (subCategory) {
            itemKey = `${name}-${subCategory.name}`;
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

      setItemManifest((prevManifest: any) => ({
        ...prevManifest,
        [itemRoute]: { details: manifestDetail, summary: manifestItem },
      }));
    }
  };

  return { orderPrint, itemManifest, setItemManifest, nonVoidOrders };
};

export default useManifest;
