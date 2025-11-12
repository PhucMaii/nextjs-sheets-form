import { Client } from '@upstash/qstash';

if (!process.env.QSTASH_TOKEN) {
  throw new Error('QSTASH_TOKEN is missing');
}
if (!process.env.APP_BASE_URL) {
  throw new Error('APP_BASE_URL is missing');
}

export const qstash = new Client({ token: process.env.QSTASH_TOKEN });

interface EmailPayload {
  user: any; // keep same shape you send to sendEmail
  order: any; // (you pass orderUpdated below)
  orderId: number;
  deliveryDate: string;
  note: string;
  subjectTag: string;
}

export async function enqueueEmail(payload: EmailPayload) {
    const target = `${process.env.NEXT_PUBLIC_WEB_URL}/api/queues/email`;
    
    await qstash.publishJSON({
        url: target,
        body: payload,
        retries: 3,
        backoff: 'exponential',
        timeout: 900,
        dedupe: true
    })
}
