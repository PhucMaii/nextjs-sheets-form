import { Program, ZoneWater } from '../admin/[companyId]/components/Farm/types';

export const primaryProgramColor = '#2196F3';

export const getProgramById = (id: string | number, programs: Program[]) => {
  const program = programs?.find((p: Program) => p.id == id);
  return program;
};

export const getProgramColor = (id: string | number, programs: Program[] | any[]) => {
  return '#2196F3';
};

export const getProgramColorByZoneWaterPrograms = (zoneWaterPrograms: ZoneWater[]) => {
  return zoneWaterPrograms?.length > 10 ? '#4CAF50' : '#2196F3';
};