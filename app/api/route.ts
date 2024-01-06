import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from './auth/[...nextauth]/option';

export async function GET() {
  const session = await getServerSession(authOptions);
  console.log('GET API', session);

  if (!session) {
    return new NextResponse(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
    });
  }
  return NextResponse.json({ authenticated: !!session });
}
