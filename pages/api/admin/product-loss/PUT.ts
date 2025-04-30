import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { id, quantityLost, lossType, description, reportedBy, reportedDate } = req.body;
        
    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({
            error: 'Internal Server Error: ' + error
        });     
    }
}