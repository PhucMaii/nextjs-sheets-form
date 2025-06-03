import prisma from '@/client';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function DELETE(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const existingPayroll = await prisma.payroll.findUnique({
      where: { id: Number(id) },
    });

    if (!existingPayroll) {
      return res.status(404).json({ error: 'Payroll not found' });
    }

    const payroll = await prisma.payroll.delete({
      where: { id: Number(id) },
    });

    res
      .status(200)
      .json({ data: payroll, message: 'Payroll deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
