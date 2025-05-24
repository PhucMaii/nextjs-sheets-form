import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import useSWR from 'swr';
import { fetcher } from './AuthenGuard';
// import { API_URL } from '../app/utils/enum';

export default function LoginAndRegisterGuard({ children }: any) {
  const router = useRouter();

  const { data: session } = useSWR('/api/auth/session', fetcher, {
    revalidateOnFocus: false,
  });

  // const { data: user } = useSWR(
  //   session?.user && !session.user.name
  //     ? `${API_URL.USER}?id=${session.user.id}&role=${session.user.role}`
  //     : null,
  //   fetcher,
  //   {
  //     revalidateOnFocus: false,
  //   },
  // );
  // const { data: driver } = useSWR(
  //   session?.user?.name ? `${API_URL.DRIVER}?id=${session.user.id}` : null,
  //   fetcher,
  //   {
  //     revalidateOnFocus: false,
  //   },
  // );

  // console.log({ session }, 'session');

  useEffect(() => {
    if (session?.user?.role === 'driver') {
      router.push('/driver/overview');
    } else if (
      session?.user?.role === 'admin' ||
      session?.user?.role === 'super admin'
    ) {
      router.push(`/admin/${session?.user?.companyId}/orders`);
    } else if (session?.user?.role === 'client') {
      router.push('/');
    }
  }, [session]);

  return children;
}
