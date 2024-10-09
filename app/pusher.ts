import PusherServer from 'pusher';
import PusherClient from 'pusher-js';

const appId = process.env.PUSHER_APP_ID!;
const key = process.env.NEXT_PUBLIC_PUSHER_APP_KEY!;
const secret = process.env.PUSHER_APP_SECRET!;

// Initialize Pusher Server only if in production
export const pusherServer =
  process.env.NEXT_PUBLIC_CURRENT_STATE === 'production'
    ? new PusherServer({
        appId,
        key,
        secret,
        cluster: 'us3',
        useTLS: true,
      })
    : null;

// Initialize Pusher Client only if in production
export const pusherClient =
  process.env.NEXT_PUBLIC_CURRENT_STATE === 'production'
    ? new PusherClient(key, {
        cluster: 'us3',
        authEndpoint: '/api/pusher-auth',
        authTransport: 'ajax',
        auth: {
          headers: {
            'Content-type': 'application/json',
          },
        },
      })
    : null;
