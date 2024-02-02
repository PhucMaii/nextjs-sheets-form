import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { PrismaClient } from "@prisma/client";

type HandlerFunction = (
    req: NextApiRequest,
    res: NextApiResponse
) => Promise<any>;

const withAuthGuard = <T extends HandlerFunction>(handler: T) => async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const prisma = new PrismaClient();

        const session: any = await getServerSession(req, res, authOptions);

        if (!session) {
            return res.status(401).json({error: 'You are not authenticated'});
        }

        const existingUser = await prisma.user.findUnique({
            where: {
                id: Number(session.user.id)
            }
        })

        if (!existingUser) {
            return res.status(404).json({error: 'User Not Found in DB'});
        }
        
        return await handler(req, res);
    } catch (error: any) {
        console.log('Internal Server Error in checking auth', error);
        return res.status(500).json({
            error: 'Internal Server Error: ' + error
        })
    }
}

export default withAuthGuard;