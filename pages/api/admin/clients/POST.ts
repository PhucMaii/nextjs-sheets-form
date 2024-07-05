import { USER_ROLE } from '@/app/utils/enum';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { hash } from 'bcrypt';
import { NextApiRequest, NextApiResponse } from 'next';

interface BodyTypes {
  clientId: string;
  clientName: string;
  contactNumber: string;
  deliveryAddress: string;
  role: USER_ROLE;
  categoryId: number;
  subCategoryId: number;
  preference: any;
}

const GEOCODING_API_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
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
      subCategoryId,
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
    const addresss = await generateLatLng(deliveryAddress);

    const newClient = await prisma.user.create({
      data: {
        clientId,
        sheetName: clientId,
        clientName,
        contactNumber,
        deliveryAddress,
        role,
        categoryId,
        subCategoryId,
        password: newPassword,
        deliveryAddressLat: addresss.latitude,
        deliveryAddressLng: addresss.longitude
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

const generateLatLng = async (deliveryAddress: string) => {
  if (deliveryAddress === 'N/A') {
    return { latitude: null, longitude: null };
  }

  const response = await axios.get(GEOCODING_API_URL, {
    params: {
      address: deliveryAddress,
      key: process.env.NEXT_PUBLIC_MAPS_KEY,
    },
  });

  if (response.data.status === 'OK') {
    const location = response.data.results[0].geometry.location;
    return { latitude: location.lat, longitude: location.lng };
  }

  return { latitude: null, longitude: null };
};
