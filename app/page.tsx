import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]/route';
import Dashboard from './dashboard/Dashboard';

export default async function Home() {
  const session: any = await getServerSession(authOptions);

  return (
    <main className="bg-gray-100 min-h-screen pb-4">
      <Dashboard userId={session?.user.id} isLogin={!!session} />
    </main>
  );
}
