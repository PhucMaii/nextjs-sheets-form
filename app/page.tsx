import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { User } from "./user";
import { LoginButton, LogoutButton } from "./auth";
import Dashboard from "./dashboard/Dashboard";

export default async function Home() {
  const session = await getServerSession(authOptions);
  console.log(session);

  return (
    <main className="bg-gray-100 min-h-screen">
      <Dashboard isLogin={!!session}/>
    </main>
  );
}
