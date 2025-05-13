import { useRouter, usePathname } from 'next/navigation';
import { FC, useEffect } from 'react';
import LoadingComponent from '../app/components/LoadingComponent/LoadingComponent';
import axios from 'axios';
import { USER_ROLE } from '../app/utils/enum';
import useSWR from 'swr';

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

  const {
    data: session,
    error: sessionError,
    isValidating: isSessionValidating,
  } = useSWR('/api/auth/session', fetcher, {
    revalidateOnFocus: false,
  });
  console.log('pathname?.split("/")[2]"', pathname?.split("/")[2]);
  console.log('session?.user.companyId', session?.user?.companyId);
  useEffect(() => {
    if (
      (sessionError ||
        (!isSessionValidating && Object.keys(session).length === 0)) &&
      pathname !== '/driver/login'
    ) {
      router.push('/auth/login');
    } else if (
      session?.user &&
      (pathname?.startsWith('/admin') || pathname?.startsWith('/driver')) &&
      session.user.role === USER_ROLE.CLIENT
    ) {
      router.push('/');
    } else if (
      session?.user &&
      (session?.user.role === USER_ROLE.ADMIN ||
        session?.user.role === USER_ROLE.SUPER_ADMIN) &&
      (!pathname?.startsWith('/admin') ||
        session?.user.companyId !== Number(pathname?.split('/')[2]))
    ) {
      router.push(`/admin/${session?.user.companyId}/orders`);
    } else if (
      session?.user &&
      session?.user.role === USER_ROLE.DRIVER &&
      !pathname?.startsWith('/driver')
    ) {
      router.push('/driver/overview');
    }
  }, [pathname, session]);

  return children;
}
