import { nanoid } from 'nanoid';
import { NextApiRequest, NextApiResponse } from 'next';
import { pusherServer } from '@/app/pusher';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(404).json({
      error: 'Your method is not supported',
    });
  }

  const data = req.body; // Assuming you're sending JSON data in the body
  const { socketId, channelName } = data;

  if (!socketId || !channelName) {
    return res.status(400).json({
      error: 'Invalid data provided',
    });
  }

  const id = nanoid();

  const presenceData = {
    user_id: id,
    user_data: { user_id: id },
  };

  try {
    const auth = await pusherServer.authorizeChannel(
      socketId,
      channelName,
      presenceData,
    );

    return res.status(200).json(auth);
  } catch (error) {
    console.error('Error generating authorization:', error);
    return res.status(500).json({
      error: 'Internal server error',
    });
  }
}
