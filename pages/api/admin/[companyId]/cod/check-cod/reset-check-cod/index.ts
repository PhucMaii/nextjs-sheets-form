import prisma from "@/client";
import withAdminAuthGuard from "@/pages/api/utils/withAdminAuthGuard";
import { NextApiRequest, NextApiResponse } from "next";

interface IBody {
  boardId: number;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'POST') {
      return res.status(404).json({ error: 'Your method is not supported' });
    }

    const { boardId }: IBody = req.body;

    const board = await prisma.codBoard.findUnique({
      where: {
        id: boardId,
      },
      include: {
        orders: true,
      },
    });

    if (!board) {
      return res.status(400).json({ error: 'Board not found' });
    }

    await prisma.orders.updateMany({
      where: {
        id: { in: board.orders.map((order) => order.id) },
      },
      data: {
        isCODCheck: false,
      },
    });

    return res.status(200).json({ message: 'Reset check cod successfully' });
  } catch (error) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}

export default withAdminAuthGuard(handler);