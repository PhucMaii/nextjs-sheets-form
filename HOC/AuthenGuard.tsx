import { useRouter, usePathname } from 'next/navigation';
import { FC, useEffect } from 'react';
import LoadingComponent from '../app/components/LoadingComponent/LoadingComponent';
import axios from 'axios';
import { USER_ROLE } from '../app/utils/enum';
import useSWR from 'swr';
import useLocalStorage from '@/hooks/useLocalStorage';

export const SplashScreen: FC = () => (
  <div className="flex flex-col gap-8 justify-center items-center pt-8 h-screen">
    <LoadingComponent />
  </div>
);

export const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export default function AuthenGuard({ children }: any) {
  // const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();

  const [role, setRole] = useLocalStorage('role', null);

  const {
    data: session,
    error: sessionError,
    isValidating: isSessionValidating,
  } = useSWR('/api/auth/session', fetcher, {
    revalidateOnFocus: false,
  });

  useEffect(() => {
    if (session?.user && !role) {
      setRole(session?.user.role);
    }

    if (
      (sessionError ||
        (!isSessionValidating && Object.keys(session).length === 0)) &&
      (pathname?.startsWith('/admin') || pathname?.startsWith('/driver') || pathname?.startsWith('/user')) &&
      pathname !== '/driver/login'
      // pathname !== '/auth/login'
    ) {
      router.push('/');
    } else if (
      session?.user &&
      !pathname?.startsWith('/user') &&
      session.user.role === USER_ROLE.CLIENT
    ) {
      router.push('/user/overview');
    } else if (
      session?.user &&
      (session?.user.role === USER_ROLE.ADMIN ||
        session?.user.role === USER_ROLE.SUPER_ADMIN)
    ) {
      console.log('accessing admin', role);
      if (role === USER_ROLE.DRIVER && !pathname?.startsWith('/driver')) {
        console.log('accessing first admin');
        router.push('/driver/overview');
      } else if (!pathname?.startsWith('/admin') && role !== USER_ROLE.DRIVER) {
        console.log('accessing second admin');
        router.push(`/admin/${session?.user.companyId}/orders`);
      }
    } else if (
      session?.user &&
      (session?.user.role === USER_ROLE.DRIVER || session?.user.role === USER_ROLE.WAREHOUSE) &&
      !pathname?.startsWith('/driver')
    ) {
      router.push('/driver/overview');
    }
  }, [pathname, session, role]);

  if (!session) {
    return <LoadingComponent />;
  }

  return children;
}
