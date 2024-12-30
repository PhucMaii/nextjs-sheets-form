import { NextApiRequest, NextApiResponse } from 'next';
import emailHandler from '../utils/email';
import { signUpRequest } from '@/config/email';

interface IBody {
  name: string;
  email: string;
  contactNumber: string;
  deliveryAddress: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(500).json({ error: 'Only POST method allowed' });
  }
  try {
    const { name, email, contactNumber, deliveryAddress }: IBody = req.body;

    // Send Email to Admin
    const template = signUpRequest({ name, email, contactNumber, deliveryAddress });
    await emailHandler(
      'maithienphuc0102@gmail.com',
      'New Client Sign Up Request',
      'New Client Sign Up Request',
      template,
    );

    return res.status(200).json({ message: 'Your Request has been sent successfully' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
