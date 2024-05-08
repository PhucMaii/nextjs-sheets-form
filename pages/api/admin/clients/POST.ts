import { USER_ROLE } from '@/app/utils/enum';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';
import { NextApiRequest, NextApiResponse } from 'next';

interface BodyTypes {
  clientId: string;
  clientName: string;
  contactNumber: string;
  deliveryAddress: string;
  role: USER_ROLE;
  categoryId: number;
  preference: any;
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const {
      clientId,
      clientName,
      contactNumber,
      deliveryAddress,
      role,
      categoryId,
      preference,
    } = req.body as BodyTypes;

    const existingClientId = await prisma.user.findUnique({
      where: {
        clientId,
      },
    });

    if (existingClientId) {
      return res.status(401).json({
        error: 'Client Id Exists Already',
      });
    }

    const newPassword = await hash(contactNumber, 12);

    const newClient = await prisma.user.create({
      data: {
        clientId,
        sheetName: clientId,
        clientName,
        contactNumber,
        deliveryAddress,
        role,
        categoryId,
        password: newPassword,
      },
    });

    const newUserPreference = await prisma.userPreference.create({
      data: { ...preference, userId: newClient.id },
    });

    const updatedClient = await prisma.user.update({
      where: {
        id: newClient.id,
      },
      data: {
        userPreferenceId: newUserPreference.id,
      },
      include: {
        preference: true,
        category: true,
      },
    });

    return res.status(201).json({
      data: updatedClient,
      message: 'New Client Created Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
