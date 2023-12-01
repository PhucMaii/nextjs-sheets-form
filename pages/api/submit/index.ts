import { google } from "googleapis";
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from '@prisma/client';

type UserForm = {
    firstName: string
    email: string
    password: string
}
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const prisma = new PrismaClient();
       if(req.method === "GET") {
        const users = await prisma.user.findMany();
        return res.send(users);
       } 
       else if(req.method === "POST") {
        const body: UserForm = req.body
        const newUser = await prisma.user.create({
            data: {
                firstName: body.firstName,
                email: body.email,
                password: body.password
            }
        });
        return res.status(201).send(newUser);
       }

    } catch(error) {
        console.log(error);
        return res.status(500).send({message: "Something went wrong"})
    }
} 