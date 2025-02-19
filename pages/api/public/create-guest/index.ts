import { USER_ROLE } from '@/app/utils/enum';
import { verifySessionId } from '@/app/utils/security';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { generateLatLng } from '../../admin/clients/POST';
import bcrypt from 'bcryptjs';
import { verifyDeliveryAddress } from '../../utils/address';
import emailHandler from '../../utils/email';
import { signUpRequest } from '@/config/email';
import { getTodayDate } from '../../utils/date';

interface IBody {
  guestSessionId: string;
  guestSessionSignature: string;
  name: string;
  contactName: string;
  email: string;
  contactNumber: string;
  deliveryAddress: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const {
      guestSessionId,
      guestSessionSignature,
      name,
      contactName,
      email,
      contactNumber,
      deliveryAddress,
    }: IBody = req.body;

    const newGuest = await createGuest({
      guestSessionId,
      guestSessionSignature,
      clientName: name,
      contactName,
      email,
      contactNumber,
      deliveryAddress,
    });

    // if (!guestSessionId || !guestSessionSignature) {
    //   return res.status(400).json({
    //     error: 'Guest Session Id and Guest Session Signature are required',
    //   });
    // }

    // // Verify Guest Session
    // const isGuestSessionValid = verifySessionId(
    //   guestSessionId,
    //   guestSessionSignature,
    // );

    // if (!isGuestSessionValid) {
    //   return res.status(401).json({ error: 'Guest Session is not valid' });
    // }

    // const existingGuest = await prisma.user.findFirst({
    //   where: {
    //     guestSessionId,
    //     role: USER_ROLE.GUEST,
    //   },
    // });

    // if (existingGuest) {
    //   return res.status(400).json({ error: 'Guest already exists' });
    // }

    // // Verify and Generate address lat and lng=
    // const address = await generateLatLng(deliveryAddress);
    // const isDeliveryAddressValid = verifyDeliveryAddress(
    //   address.latitude,
    //   address.longitude,
    // );

    // if (!isDeliveryAddressValid) {
    //   return res.status(400).json({
    //     error: 'Delivery Address is not valid',
    //   });
    // }

    // // Generate password
    // const password = await bcrypt.hash(guestSessionId, 12);

    // // Generate client id
    // const clientId = await generateGuestClientId();

    // const newGuest = await prisma.user.create({
    //   data: {
    //     clientName: name,
    //     clientId,
    //     password,
    //     categoryId: 334,
    //     sheetName: clientId,
    //     email,
    //     contactNumber,
    //     deliveryAddress,
    //     deliveryAddressLat: address.latitude,
    //     deliveryAddressLng: address.longitude,
    //     role: USER_ROLE.GUEST,
    //     guestSessionId,
    //   },
    // });

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

export const createGuest = async (client: any) => {
  const prisma = new PrismaClient();
  try {
    if (!client.guestSessionId || !client.guestSessionSignature) {
      throw new Error(
        'Guest Session Id and Guest Session Signature are required',
      );
    }

    // Verify Guest Session
    const isGuestSessionValid = verifySessionId(
      client.guestSessionId,
      client.guestSessionSignature,
    );

    if (!isGuestSessionValid) {
      throw new Error('Guest Session is not valid');
    }

    const existingGuest = await prisma.user.findFirst({
      where: {
        guestSessionId: client.guestSessionId,
        role: USER_ROLE.GUEST,
      },
    });

    if (existingGuest) {
      throw new Error('Guest already exists');
    }

    // Verify and Generate address lat and lng=
    const address = await generateLatLng(client.deliveryAddress);

    if (!address.latitude || !address.longitude) {
      throw new Error('Delivery Address is not valid');
    }

    const isDeliveryAddressValid = verifyDeliveryAddress(
      address.latitude,
      address.longitude,
    );

    if (!isDeliveryAddressValid) {
      throw new Error('Sorry we currently do not deliver to your area');
    }

    // Generate password
    const password = await bcrypt.hash(client.guestSessionId, 12);

    // Generate client id
    const clientId = await generateGuestClientId();

    const { date, time } = getTodayDate();

    console.log(client.guestSessionId);

    const newGuest = await prisma.user.create({
      data: {
        clientName: client.clientName,
        clientId,
        password,
        categoryId: 334,
        sheetName: clientId,
        contactName: client?.contactName,
        email: client.email,
        contactNumber: client.contactNumber,
        deliveryAddress: client.deliveryAddress,
        deliveryAddressLat: address.latitude,
        deliveryAddressLng: address.longitude,
        role: USER_ROLE.GUEST,
        guestSessionId: client.guestSessionId,
        createdAt: `${date} ${time}`,
        type: client?.type,
      },
    });

    // Send request email to admin
    const template = signUpRequest({
      name: client.clientName,
      email: client.email,
      contactNumber: client.contactNumber,
      deliveryAddress: client.deliveryAddress,
      message: client.message,
    });
    await emailHandler(
      'maithienphuc0102@gmail.com',
      'New Client Sign Up Request',
      'New Client Sign Up Request',
      template,
    );

    // TODO: Send confirm email to client

    return newGuest;
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    throw new Error('Internal Server Error: ' + error);
  }
};
