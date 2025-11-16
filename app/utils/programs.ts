import { ProgramSchedule, WaterStatus } from '@prisma/client';
import { Program } from '../admin/[companyId]/components/Farm/types';
import { green } from '@mui/material/colors';

export const primaryProgramColor = '#2196F3';

export const getProgramById = (id: string | number, programs: Program[]) => {
  const program = programs?.find((p: Program) => p.id == id);
  return program;
};

export const getProgramByIdAndSchedules = (
  id: string | number,
  daySchedules: any[],
) => {
  const selectedDaySchedule = daySchedules.find((daySchedule: any) =>
    daySchedule.programs.find((p: any) => p.id == id),
  );
  if (!selectedDaySchedule) return null;
  const program = selectedDaySchedule.programs.find((p: any) => p.id == id);
  return { program, daySchedule: selectedDaySchedule };
};

export const getScheduleProgramColor = (scheduleProgram: ProgramSchedule) => {
  switch (scheduleProgram?.status || WaterStatus.SCHEDULED) {
    case WaterStatus.SCHEDULED:
      return primaryProgramColor;
    case WaterStatus.ACTIVE:
      return green[500];
    case WaterStatus.FINISHED:
      return green[700];
    default:
      return primaryProgramColor;
  }
};
