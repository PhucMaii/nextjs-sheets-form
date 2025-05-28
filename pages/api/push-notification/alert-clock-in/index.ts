import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import webpush from 'web-push';
// import { getTodayDate } from '../../utils/date';
import { getTodayDate } from '../../utils/date';
// import { getDriverInfo } from '../../utils/auth';

const prisma = new PrismaClient();

// let driverId: any = null;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const vapidKeys = {
      publicKey: process.env.NEXT_PUBLIC_VAPID_KEY!,
      privateKey: process.env.SECRET_VAPID_KEY!,
    };

    webpush.setVapidDetails(
      'mailto:maithienphuc0102@gmail.com',
      vapidKeys.publicKey,
      vapidKeys.privateKey,
    );

    const today = getTodayDate();

    const scheduledShifts = await prisma.scheduledShift.findMany({
      where: {
        companyId: 1,
        queryDate: today.date,
      },
      include: {
        employee: true,
      },
    });

    const shiftInHour = scheduledShifts.filter((shift) => {
      let nowHour = Number(today.time.split(':')[0]);
      const pmOrAm = today.time.split(' ')[1];

      if (pmOrAm === 'PM') {
        nowHour = Number(nowHour) + 12;
      }

      return nowHour === Number(shift.startedAt.split(' ')[1].split(':')[0]);
    });

    for (const shift of shiftInHour) {
      console.log('🔔 Driver: ', shift.employee.name);

      // if (!currentRoute) {
      //   continue;
      // }

      try {
        console.log(
          '🔔 Send push notification to driver: ',
          shift.employee.notification,
        );
        const subscription = JSON.parse(shift.employee.notification as string);
        console.log(subscription);

        if (!subscription) {
          continue;
        }

        const diffInMinutes = Number(
          shift.startedAt.split(' ')[1].split(':')[1],
        );

        const message =
          diffInMinutes > 0
            ? `Your shift is starting in ${diffInMinutes} minutes`
            : 'Your shift is starting now';

        console.log('send successfully');
        await webpush.sendNotification(
          subscription,
          JSON.stringify({
            message: 'Hello ' + shift.employee.name,
            body: `${message}. Don't forget to clock in and check your route!`,
          }),
        );
      } catch (error: any) {
        console.log('🔔 Error send push notification to driver: ', error);
        if (error.statusCode === 410 || error.statusCode === 404) {
          await prisma.employee.update({
            where: {
              id: shift.employee.id,
            },
            data: {
              notification: {},
            },
          });

          console.log('🗑️ Removed expired subscription:');
        }
      }
    }

    return res.status(200).json({ message: 'Push Notification Successfully' });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);

    // return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
};

export default handler;
