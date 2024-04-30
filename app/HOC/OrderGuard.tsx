import { getSession, useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../utils/enum';
import { SplashScreen } from './AuthenGuard';
import { Order } from '../admin/orders/page';
import { generateRecommendDate } from '../utils/time';

export default function OrderGuard({ children }: any) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
const [hasOrder, setHasOrder] = useState<boolean>(false);
  const {data: session}: any = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    handleFetchClientOrders();
  }, [])
  
  const handleFetchClientOrders = async () => {
    try {
        setIsLoading(true);
        const response = await axios.get(`${API_URL.USER}?id=${session?.user.id}`);

        if (response.data.error) {
            console.log(response.data.error);
        setIsLoading(false);

            return;
        }

        const deliveryDateTarget = generateRecommendDate();

        const hasOrderToday = response.data.data.Orders.some((order: Order) => {
            return order.deliveryDate === deliveryDateTarget;
        });

        setHasOrder(hasOrderToday);
        if (hasOrderToday) {
            router.push('/');
        }

        setIsLoading(false);

    } catch (error: any) {
        console.log('Fail to fetch clients: ', error);
        setIsLoading(false);
    }
  }

  return isLoading ? <SplashScreen /> : children;
}
