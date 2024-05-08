// import { PrismaClient } from '@prisma/client';
// import { NextApiRequest, NextApiResponse } from 'next';

// export default async function GET(req: NextApiRequest, res: NextApiResponse) {
//   try {
//     const prisma = new PrismaClient();

//     const { userId } = req.query;

//     const existingUser = await prisma.user.findUnique({
//       where: {
//         id: Number(userId),
//       },
//     });

//     if (!existingUser) {
//       return res.status(404).json({
//         error: 'User Not Found',
//       });
//     }

//     if (!existingUser.scheduleOrdersId) {
//       return res.status(200).json({
//         error: 'No Schedule Order Id Yet',
//       });
//     }

//     const scheduleOrder = await prisma.scheduleOrders.findUnique({
//       where: {
//         id: existingUser.scheduleOrdersId,
//       },
//       include: {
//         items: true,
//       },
//     });

//     return res.status(200).json({
//       data: scheduleOrder,
//       message: 'Fetch Schedule Order Successfully',
//     });
//   } catch (error: any) {
//     console.log('Internal Server Error: ' + error);
//     return res.status(500).json({
//       error: 'Internal Server Error: ' + error,
//     });
//   }
// }
