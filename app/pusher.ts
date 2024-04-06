import PusherServer from 'pusher';
import PusherClient from 'pusher-js';

const appId: any = process.env.PUSHER_APP_ID;
const key: any = process.env.NEXT_PUBLIC_PUSHER_APP_KEY;
const secret: any = process.env.PUSHER_APP_SECRET;

export const pusherServer = new PusherServer({
  appId,
  key,
  secret,
  cluster: 'us3',
  useTLS: true,
} as any);

export const pusherClient = new PusherClient(key, {
  cluster: 'us3',
  authEndpoint: '/api/pusher-auth',
  authTransport: 'ajax',
  auth: {
    headers: {
      'Content-type': 'application/json',
    },
  },
});
