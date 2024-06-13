import { Order } from '@/app/admin/orders/page';
import { groupBy } from '@/app/utils/array';
import { ORDER_STATUS } from '@/app/utils/enum';
import { IItem, IRoutes } from '@/app/utils/type';
import { UserRoute } from '@prisma/client';
import { useEffect, useState } from 'react';
import _ from 'lodash';

const useManifest = (
  orderList: Order[],
  routes: IRoutes[],
  selectedRoutes: IRoutes[],
) => {
  const [orderPrint, setOrderPrint] = useState<any>([]);
  const [itemManifest, setItemManifest] = useState<any>({});
  // Filter void orders
  const nonVoidOrders = orderList.filter(
    (order: Order) => order.status !== ORDER_STATUS.VOID,
  );

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

  // O(n^3) need to optimize this
  const getClientRoutes = (): any => {
    const clientRoutes = nonVoidOrders.map((order: Order): any => {
      // Filter user routes to get only routes related to current given list of routes
      const relatedRoutes = order.user?.routes
        ?.filter((route: UserRoute): any => {
          const relatedRoute = selectedRoutes.find(
            (baseRoute: IRoutes) => baseRoute.id === route.routeId,
          );
          return !!relatedRoute;
        })
        .map((route: UserRoute): any => ({
          // map to attach order information
          routeId: route.routeId,
          ...order,
        }));
      return relatedRoutes;
    });
    const orderByRoutes = _.orderBy(clientRoutes.flat(), ['routeId'], ['asc']);
    setOrderPrint(orderByRoutes);
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
          };
        } else {
          return { ...item, routeId: order.routeId, client: order.clientName };
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
    const groupItemClients: any = groupBy(
      items.flat(),
      ({ client }: any) => client,
    );
    console.log(groupItemClients, 'groupItemClients');

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
          if (itemKey === 'BEAN 5 LB-B.K') {
            console.log({ current: acc[itemKey], item, itemKey });
          }
          return acc;
        },
        {},
      );

      setItemManifest((prevManifest: any) => ({
        ...prevManifest,
        [itemRoute]: manifestItem,
      }));
    }
  };

  return { orderPrint, itemManifest, setItemManifest, nonVoidOrders };
};

export default useManifest;
