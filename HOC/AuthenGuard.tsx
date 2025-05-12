import { useRouter, usePathname } from 'next/navigation';
import { FC, useEffect } from 'react';
import LoadingComponent from '../app/components/LoadingComponent/LoadingComponent';
import axios from 'axios';
import { API_URL, USER_ROLE } from '../app/utils/enum';
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

  const { data: user } = useSWR(
    session?.user && !session.user.name
      ? `${API_URL.USER}?id=${session?.user.id}`
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
    },
  );

  const { data: employee } = useSWR(
    session?.user?.name ? `/api/employee` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    },
  );

  // console.log('employee', {employee, session});

  useEffect(() => {
    if (
      (sessionError ||
        (!isSessionValidating && Object.keys(session).length === 0)) &&
      pathname !== '/driver/login'
    ) {
      router.push('/auth/login');
    } else if (
      user &&
      (pathname?.startsWith('/admin') || pathname?.startsWith('/driver')) &&
      user.data.role === USER_ROLE.CLIENT
    ) {
      router.push('/');
    } else if (
      employee &&
      (employee.data.role === USER_ROLE.ADMIN ||
        employee.data.role === USER_ROLE.SUPER_ADMIN) &&
      !pathname?.startsWith('/admin')
    ) {
      router.push(`/admin/${employee.data.companyId}/orders`);
    } else if (
      employee &&
      employee.data.role === USER_ROLE.DRIVER &&
      !pathname?.startsWith('/driver')
    ) {
      router.push('/driver/overview');
    }
  }, [pathname, session, user, employee]);

  return children;
}
