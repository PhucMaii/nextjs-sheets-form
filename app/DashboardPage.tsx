import { getServerSession } from 'next-auth';
import Dashboard from './dashboard/Dashboard';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export default async function Home() {
  const session: any = await getServerSession(authOptions);

  return (
    <main className="bg-gray-100 min-h-screen pb-4">
      <Dashboard userId={session?.user.id} isLogin={!!session} />
    </main>
  );
}