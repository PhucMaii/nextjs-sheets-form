import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/client";

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { companyId } = req.query;
    
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const employee = await prisma.employee.findUnique({
      where: {
        id: Number(session.user.id),
        companyId: Number(companyId),
      },
    });

    return res.status(200).json({
      data: employee,
      message: 'Employee fetched successfully',
    });
  } catch (error) {
    console.error(error);
  }
}
