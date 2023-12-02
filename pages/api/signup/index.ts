import { google } from "googleapis";
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from '@prisma/client';
import { hash } from "bcrypt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/dist/server/api-utils";

type UserForm = {
    firstName: string
    email: string
    password: string
}
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const prisma = new PrismaClient();
    if(req.method !== 'POST') {
        return res.status(500).send({message: "Only POST method allowed"});
    }
    try {
        const userData: UserForm = req.body;
        const password = await hash(userData.password, 12);
        const newUser = await prisma.user.create({
            data: {
                firstName: userData.firstName,
                email: userData.email,
                password
            }
        })
        return res.status(201).send(newUser);
    } catch(error) {
        console.log(error);
        return res.status(500).send({message: "Something went wrong"})
    }
} 