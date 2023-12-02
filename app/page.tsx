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
      {/* <LoginButton />
      <LogoutButton />
      <h2>Server Session</h2>
      <div>Home Page</div>
      <pre>{JSON.stringify(session)}</pre>
      <h2>Client Session</h2>
      <User /> */}
      <Dashboard isLogin={!!session}/>
    </main>
  );
}
