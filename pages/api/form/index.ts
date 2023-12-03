import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { google } from "googleapis";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const prisma = new PrismaClient();
    if(req.method === "POST") {
        const session = await getServerSession(authOptions);
        console.log(session?.user);
        const body = req.body;
        try {
            // const newForm = await prisma.form.create({
            //     data: {
                    
            //     }
            // })

        } catch(error) {
            console.log(error);
        }
    }
}