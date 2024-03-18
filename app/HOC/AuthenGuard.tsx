import { getSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { FC, useEffect, useState } from 'react';
import LoadingComponent from '../components/LoadingComponent/LoadingComponent';
import axios from 'axios';
import { API_URL } from '../utils/enum';

const SplashScreen: FC = () => (
  <div className="flex flex-col gap-8 justify-center items-center pt-8 h-screen">
    <LoadingComponent color="blue" />
  </div>
);

export default function AuthenGuard({ children }: any) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkSession = async () => {
      const session: any = await getSession();
      
      if (!session) {
        router.push('/auth/login');
      } else {
        if (pathname?.startsWith('/admin')) {
          const response: any = await axios.get(`${API_URL.USER}?id=${session?.user.id}`);
          if (response.data.data.role === 'client') {
            router.push('/');
          }
        }
      }
      

      setIsLoading(false);
    };
    checkSession();
  }, [pathname]);

  return isLoading ? <SplashScreen /> : children;
}
