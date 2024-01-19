import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

interface BodyProps {
    userId: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
    firstName?: string;
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
    try {
        const prisma = new PrismaClient();

        const { userId, email, currentPassword, newPassword, firstName }: BodyProps = req.body;

        const existingUser = await prisma.user.findUnique({
            where: {
                id: parseInt(userId),
            }
        })

        if (!existingUser) {
            return res.status(404).json({error: 'User Not Found'});
        }

        const updateFields: any = {};

        if (email) {
            updateFields.email = email;
        }

        const updatedUser = await prisma.user.update({
            where: {
                id: parseInt(userId),
            },
            data: {
                email: email ? email : existingUser.email,
            }
        })


    } catch (error) {
        console.log('Internal Server Error', error);
        return res.status(500).json({error: 'Internal Server Error ' + error});
    }
}