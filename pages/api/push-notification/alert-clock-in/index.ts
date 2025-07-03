import { NextApiRequest, NextApiResponse } from 'next';
import webpush from 'web-push';
// import { getTodayDate } from '../../utils/date';
import { getTodayDate } from '../../utils/date';
import prisma from '@/client';
// import { getDriverInfo } from '../../utils/auth';

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

    const shiftNeedToClockIn = scheduledShifts.filter((shift) => {
      const nowHour = Number(today.time.split(':')[0]);
      const nowPmOrAm = today.time.split(' ')[1];

      const shiftHour = Number(shift.startedAt.split('  ')[1].split(':')[0]);
      const shiftPmOrAm = shift.startedAt.split('  ')[1].split(' ')[1];

      if (shiftPmOrAm !== nowPmOrAm) {
        return false;
      }

      if (shiftHour !== nowHour) {
        return false;
      }

      const shiftMinute = Number(shift.startedAt.split('  ')[1].split(':')[1]);
      const nowMinute = Number(today.time.split(':')[1]);

      return shiftMinute - nowMinute >= 0;
    });

    // Alert Clock In
    for (const shift of shiftNeedToClockIn) {
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

        const nowMinute = Number(today.time.split(':')[1]);
        const shiftMinute = Number(shift.startedAt.split('  ')[1].split(':')[1]);

        const diffInMinutes = shiftMinute - nowMinute;

        const message =
          diffInMinutes > 0
            ? `Your shift is starting in ${diffInMinutes} minutes`
            : 'Your shift is starting now';

        console.log('send successfully');
        await webpush.sendNotification(
          subscription,
          JSON.stringify({
            message: 'Hello ' + shift.employee.name,
            body: `${message}. Don't forget to clock in! Thank you 💛`,
          }),
        );

        //Alert Clock out
        const shiftNeedToClockOut = scheduledShifts.filter((shift) => {
          if (!shift.endedAt) {
            return false;
          }

          const nowHour = Number(today.time.split(':')[0]);
          const nowPmOrAm = today.time.split(' ')[1];

          const shiftHour = Number(shift.endedAt?.split('  ')[1].split(':')[0]);
          const shiftPmOrAm = shift.endedAt?.split('  ')[1].split(' ')[1];

          if (shiftPmOrAm !== nowPmOrAm) {
            return false;
          }

          return shiftHour === nowHour;
        });

        for (const shift of shiftNeedToClockOut) {
          console.log('🔔 Driver: ', shift.employee.name);

          try {
            console.log(
              '🔔 Send push notification to driver: ',
              shift.employee.notification,
            );

            const subscription = JSON.parse(shift.employee.notification as string);

            if (!subscription) {
              continue;
            }

            const nowMinute = Number(today.time.split(':')[1]);
            const shiftMinute = Number(shift.endedAt?.split('  ')[1].split(':')[1]);

            const diffInMinutes = shiftMinute - nowMinute;

            let message;

            if (diffInMinutes > 0) {
              message = `Your shift is ending in ${diffInMinutes} minutes`;
            } else if (diffInMinutes === 0) {
              message = 'Your shift is ending now';
            } else {
              message = `Your shift is already ended ${Math.abs(diffInMinutes)} minutes ago`;
            }

            await webpush.sendNotification(
              subscription,
              JSON.stringify({
                message: 'Hello ' + shift.employee.name,
                body: `${message}. Don't forget to clock out! Thank you 💛`,
              }),
            );
          } catch (error: any) {
            console.log('🔔 Error send push notification to driver: ', error);
          }
        } 
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
