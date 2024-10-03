import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import { IDriver } from "@/app/utils/type";

interface IBody {
    name: string,
    members: IDriver[],
    createdAt: Date;
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
    try {
        const prisma = new PrismaClient();

        const { name, members, createdAt }: IBody = req.body;

        if (!name || !members) {
            return res.status(404).json({
                error: 'You are missing body data',
            });
        }

        const session: any = await getServerSession(req, res, authOptions);

        if (!session) {
            return res.status(401).json({ error: 'You are not authenticated' });
        }

        const createdBy = session.user?.id;


        const newRoom = await prisma.chatRoom.create({
          data: {
            name,
            createdAt,
            createdBy,
          },
        });

        const chatMembers = await prisma.chatMember.createMany({
            data: members.map((member: IDriver) => ({
                joinedAt: createdAt,
                driverId: member.id,
                chatRoomId: newRoom.id,
            })),
        });


    } catch (error: any) {
        console.log('Internal Server Error: ', error);
    }
}