import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { API_URL } from '../utils/enum';
import useSWR from 'swr';
import { fetcher } from './AuthenGuard';

export default function LoginAndRegisterGuard({ children }: any) {
  const router = useRouter();

  const { data: session } = useSWR('/api/auth/session', fetcher, {
    revalidateOnFocus: false,
  });

  const { data: user } = useSWR(
    session?.user ? `${API_URL.USER}?id=${session.user.id}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    },
  );

  useEffect(() => {
    if (user?.data?.role === 'admin') {
      router.push('/admin/orders');
    } else if (user?.data?.role === 'client') {
      router.push('/');
    }
  }, [user]);

  return children;
}
