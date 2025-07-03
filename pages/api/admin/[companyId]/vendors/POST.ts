import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import prisma from '@/client';

interface IBody {
  name: string;
  address: string;
  phoneNumber: string;
  email: string;
  joinedDate: string;
  createdAt: string;
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { name, address, phoneNumber, email, joinedDate, createdAt }: IBody =
      req.body;

    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: 'Missing companyId' });
    }

    const existingVendor = await prisma.vendor.findFirst({
      where: {
        name,
        address,
        phoneNumber,
        email,
        companyId: Number(companyId),
      },
    });

    if (existingVendor) {
      return res.status(500).json({
        error: 'Vendor Address Existed Already',
      });
    }

    const session: any = await getServerSession(req, res, authOptions);
    const admin: any = session?.user;

    const newVendor = await prisma.vendor.create({
      data: {
        name,
        address,
        phoneNumber,
        email,
        joinedDate,
        createdAt,
        createdBy: `Admin - ${admin.name}`,
        companyId: Number(companyId),
      },
    });

    return res.status(200).json({
      data: newVendor,
      message: 'Create New Vendor Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
