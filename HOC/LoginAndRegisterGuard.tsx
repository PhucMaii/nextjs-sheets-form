import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import useSWR from 'swr';
import { fetcher } from './AuthenGuard';
import { API_URL } from '../app/utils/enum';

export default function LoginAndRegisterGuard({ children }: any) {
  const router = useRouter();

  const { data: session } = useSWR('/api/auth/session', fetcher, {
    revalidateOnFocus: false,
  });

  const { data: user } = useSWR(
    session?.user && !session.user.name
      ? `${API_URL.USER}?id=${session.user.id}`
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
    },
  );
  const { data: driver } = useSWR(
    session?.user?.name ? `${API_URL.DRIVER}?id=${session.user.id}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    },
  );

  useEffect(() => {
    if (session?.user?.name && driver?.data) {
      router.push('/driver/overview');
    } else if (user?.data?.role === 'admin') {
      router.push('/admin/orders');
    } else if (user?.data?.role === 'client') {
      router.push('/');
    }
  }, [user, driver]);

  return children;
}
