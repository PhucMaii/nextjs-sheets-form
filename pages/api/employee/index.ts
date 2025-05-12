import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import withEmployeeAuthGuard from "../utils/withEmployeeAuthGuard";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const prisma = new PrismaClient();

      const session: any = await getServerSession(req, res, authOptions);

      console.log('session', session);

      if (!session) {
        return res.status(401).json({ error: 'You are not authenticated' });
      }

      const existingEmployee = await prisma.employee.findUnique({
        where: {
          id: Number(session.user.id),
        },
      });

      if (!existingEmployee) {
        return res.status(404).json({ error: 'User Not Found in DB' });
      }

      return res.status(200).json({
        data: existingEmployee,
        message: 'Employee fetched successfully',
      });
    } catch (error) {
        console.log('Internal Server Error in employee API', error);
        return res.status(500).json({
            error: 'Internal Server Error: ' + error,
        });
    }
}

export default withEmployeeAuthGuard(handler);
