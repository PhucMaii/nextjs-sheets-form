import { getServerSession } from "next-auth";
import { NextResponse } from 'next/server';
import { authOptions } from "./auth/[...nextauth]/route";

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    console.log("GET API", session);

    if(!session) {
        return new NextResponse(JSON.stringify({error: 'unauthorized'}), {
            status: 401
        })
    }
    return NextResponse.json({authenticated: !!session})
}