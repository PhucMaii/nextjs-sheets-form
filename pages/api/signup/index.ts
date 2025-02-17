import { NextApiRequest, NextApiResponse } from 'next';
import emailHandler from '../utils/email';
import { signUpRequest } from '@/config/email';
import { verifyDeliveryAddress } from '../utils/address';
import { generateLatLng } from '../admin/clients/POST';
import { createGuest } from '../public/create-guest';

interface IBody {
  name: string;
  email: string;
  contactNumber: string;
  deliveryAddress: string;
  message: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(500).json({ error: 'Only POST method allowed' });
  }
  try {
    const { name, email, contactNumber, deliveryAddress, message }: IBody =
      req.body;

    // Verify address
    const address = await generateLatLng(deliveryAddress);

    if (!address.latitude || !address.longitude) {
      return res.status(400).json({ error: 'Delivery Address is not valid' });
    }
    const isAddressValid = verifyDeliveryAddress(
      address.latitude,
      address.longitude,
    );

    if (!isAddressValid) {
      return res
        .status(400)
        .json({ error: 'Sorry, we currently do not deliver to your area' });
    }

    // Create guest
    const newGuest = await createGuest({
      clientName: name,
      email,
      contactNumber,
      deliveryAddress,
    });

    // Send Email to Admin
    const template = signUpRequest({
      name,
      email,
      contactNumber,
      deliveryAddress,
      message,
    });
    await emailHandler(
      'maithienphuc0102@gmail.com',
      'New Client Sign Up Request',
      'New Client Sign Up Request',
      template,
    );

    return res
      .status(200)
      .json({
        data: newGuest,
        message: 'Your Request has been sent successfully',
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
