import prisma from '@/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { ITEM_CATEGORIZED } from '../orderedItems/PUT';

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    const { id, name, daySchedules } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }

    const existingBundleProgram = await prisma.bundleProgram.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        dayPrograms: {
          include: {
            program: true,
          },
        },
      },
    });

    if (!existingBundleProgram) {
      return res.status(404).json({ error: 'Bundle program not found' });
    }

    if (name !== existingBundleProgram.name) {
      await prisma.bundleProgram.update({
        where: { id: Number(id) },
        data: { name },
      });
    }

    const allExistingPrograms = existingBundleProgram.dayPrograms.map(
      (dayProgram: any) => ({
        ...dayProgram.program,
        id: dayProgram.id,
        day: dayProgram.day,
        time: dayProgram.time,
      }),
    );

    const allInputPrograms = daySchedules.flatMap((daySchedule: any) =>
      daySchedule.programs.map((program: any) => {
        console.log({program, daySchedule});
        return {
          ...program,
          day: daySchedule.day,
        };
      }),
    );


    const categorizedDayPrograms = [];
    for (const inputProgram of allInputPrograms) {
      const existingProgram = allExistingPrograms.find(
        (existingProgram: any) => existingProgram.id === inputProgram.id,
      );
      if (
        existingProgram &&
        (existingProgram.time !== inputProgram.time ||
          existingProgram.day !== inputProgram.day)
      ) {
        categorizedDayPrograms.push({
          ...inputProgram,
          type: ITEM_CATEGORIZED.UPDATE,
        });
      } else if (!existingProgram) {
        categorizedDayPrograms.push({
          ...inputProgram,
          type: ITEM_CATEGORIZED.CREATE,
        });
      }
    }


    const deletedDayPrograms = allExistingPrograms.filter(
      (existingProgram: any) =>
        !allInputPrograms.some(
          (inputProgram: any) => inputProgram.id === existingProgram.id,
        ),
    );

    const updatedDayProgramPromises = categorizedDayPrograms.map(
      (dayProgram: any) => {
        if (dayProgram.type === ITEM_CATEGORIZED.CREATE) {
          return prisma.dayProgram.create({
            data: {
              time: dayProgram.time,
              bundleProgramId: Number(id),
              programId: Number(dayProgram.programId),
              day: dayProgram.day,
            },
          });
        } else if (dayProgram.type === ITEM_CATEGORIZED.UPDATE) {
          return prisma.dayProgram.update({
            where: { id: dayProgram.id },
            data: { time: dayProgram.time, day: dayProgram.day },
          });
        }
      },
    );

    await Promise.all(updatedDayProgramPromises);

    if (deletedDayPrograms.length > 0) {
      await prisma.dayProgram.deleteMany({
        where: {
          id: {
            in: deletedDayPrograms.map((dayProgram: any) => dayProgram.id),
          },
        },
      });
    }

    return res
      .status(200)
      .json({ message: 'Bundle program updated successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
