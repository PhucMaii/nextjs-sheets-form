import { NextApiRequest, NextApiResponse } from "next";

interface SheetForm  {
    expense: number
    revenue: number
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if(req.method !== "POST") {
        return res.status(500).send("Only Post method allowed");
    }
    const body: SheetForm = req.body;
    
}