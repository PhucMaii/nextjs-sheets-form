import { USER_ROLE } from '@/app/utils/enum';
import { verifySessionId } from '@/app/utils/security';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { generateLatLng } from '../../admin/clients/POST';
import bcrypt from 'bcryptjs';
import { verifyDeliveryAddress } from '../../utils/address';

interface IBody {
  guestSessionId: string;
  guestSessionSignature: string;
  name: string;
  email: string;
  contactNumber: string;
  deliveryAddress: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const prisma = new PrismaClient();

    const {
      guestSessionId,
      guestSessionSignature,
      name,
      email,
      contactNumber,
      deliveryAddress,
    }: IBody = req.body;

    console.log({
      guestSessionId,
      guestSessionSignature,
      name,
      email,
      contactNumber,
      deliveryAddress,
    });

    if (!guestSessionId || !guestSessionSignature) {
      return res.status(400).json({
        error: 'Guest Session Id and Guest Session Signature are required',
      });
    }

    // Verify Guest Session
    const isGuestSessionValid = verifySessionId(
      guestSessionId,
      guestSessionSignature,
    );

    if (!isGuestSessionValid) {
      return res.status(401).json({ error: 'Guest Session is not valid' });
    }

    const existingGuest = await prisma.user.findFirst({
      where: {
        guestSessionId,
        role: USER_ROLE.GUEST,
      },
    });

    if (existingGuest) {
      return res.status(400).json({ error: 'Guest already exists' });
    }

    // Verify and Generate address lat and lng=
    const address = await generateLatLng(deliveryAddress);
    const isDeliveryAddressValid = verifyDeliveryAddress(
      address.latitude,
      address.longitude,
    );

    if (!isDeliveryAddressValid) {
      return res.status(400).json({
        error: 'Delivery Address is not valid',
      });
    }

    // Generate password
    const password = await bcrypt.hash(guestSessionId, 12);

    // Generate client id
    const clientId = await generateGuestClientId();

    const newGuest = await prisma.user.create({
      data: {
        clientName: name,
        clientId,
        password,
        categoryId: 334,
        sheetName: clientId,
        email,
        contactNumber,
        deliveryAddress,
        deliveryAddressLat: address.latitude,
        deliveryAddressLng: address.longitude,
        role: USER_ROLE.GUEST,
        guestSessionId,
      },
    });

    return res.status(200).json({
      data: newGuest,
      message: 'Guest Created Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}

const generateGuestClientId = async () => {
  const prisma = new PrismaClient();

  const existingClients = await prisma.user.findMany({
    where: {
      clientId: {
        startsWith: '01',
      },
      role: USER_ROLE.GUEST,
    },
  });

  // If none found, start from 01001, else start from last clientId + 1
  let clientId = '01001';
  if (existingClients.length > 0) {
    const lastClientId = existingClients[existingClients.length - 1].clientId;
    clientId = (parseInt(lastClientId) + 1).toString();

    // If clientId is less than 5 digits, need to pad with 0
    clientId = clientId.padStart(5, '0');
  }

  return clientId;
};
