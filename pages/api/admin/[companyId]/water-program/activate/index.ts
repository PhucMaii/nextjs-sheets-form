import prisma from "@/client";
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'POST') {
      return res.status(400).json({ error: 'Your method is not supported' });
    }

    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
    }
    
    const { programId } = req.body;

    if (!programId) {
      return res.status(400).json({ error: 'Program ID is required' });
    }

    const existingWaterProgram = await prisma.waterProgram.findUnique({
      where: { id: Number(programId) },
      include: {
        zoneWaterPrograms: {
          include: {
            zoneProgram: true,
          },
        },
      },
    });

    if (!existingWaterProgram) {
      return res.status(400).json({ error: 'Water program not found' });
    }
    
    await prisma.waterProgram.update({
      where: { id: Number(programId) },
      data: { isActive: true },
    });

    for (const zoneWaterProgram of existingWaterProgram.zoneWaterPrograms) {
      await axios.get('https://api.hydrawise.com/api/v1/setzone.php', {
        params: {
          api_key: process.env.HYDRAWISE_API_KEY,
          action: 'run',
          period_id: 999,
          custom: zoneWaterProgram.zoneProgram.duration,
          relay_id: zoneWaterProgram.zoneProgram.zoneId,
        },
      });
    }

    await prisma.waterProgram.update({
        where: { id: Number(programId) },
        data: { isActive: false },
    });

    return res.status(200).json({ message: 'Water program activated successfully' });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
};