import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { User } from "./user";

export default async function Home() {
  const session = await getServerSession(authOptions);
  console.log(session);

  return (
    <main className="bg-gray-100 min-h-screen">
      <h2>Server Session</h2>
      <div>Home Page</div>
      <pre>{JSON.stringify(session)}</pre>
      <h2>Client Session</h2>
      <User />
    </main>
  );
}
