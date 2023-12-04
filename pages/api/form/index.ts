import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { POSTMethod } from "./POST";
import { GETMethod } from "./GET";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const prisma = new PrismaClient();
    try {
        if(req.method === 'POST') {
            const response = await POSTMethod(req, res, prisma);
            return response;
        }
        if(req.method === 'GET') {
            const response = await GETMethod(req, res, prisma);
            return response;
        }
        return res.status(500).send('Only POST and GET methods are allowed');
    } finally {
        await prisma.$disconnect();
    }
}