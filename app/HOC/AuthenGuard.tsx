import { useRouter, usePathname } from 'next/navigation';
import { FC, useEffect } from 'react';
import LoadingComponent from '../components/LoadingComponent/LoadingComponent';
import axios from 'axios';
import { API_URL } from '../utils/enum';
import useSWR from 'swr';

export const SplashScreen: FC = () => (
  <div className="flex flex-col gap-8 justify-center items-center pt-8 h-screen">
    <LoadingComponent color="blue" />
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
    session?.user ? `${API_URL.USER}?id=${session.user.id}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    },
  );

  useEffect(() => {
    if (
      sessionError ||
      (!isSessionValidating && Object.keys(session).length === 0)
    ) {
      router.push('/auth/login');
    } else if (
      user &&
      pathname?.startsWith('/admin') &&
      user.data.role === 'client'
    ) {
      router.push('/');
    }
  }, [pathname, session, user]);

  return children;
}
