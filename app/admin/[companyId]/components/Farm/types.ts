export interface Program {
  id: string | number;
  programId?: string | number;
  name: string;
  days: number;
  remainingDays?: number;
  isActive: boolean;
  nextScheduledRun?: Date;
  zoneWaterPrograms: any[];
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  time?: string;
  hexColor?: string;
}

export interface ZoneWater {
  zoneProgram: ZoneProgram;
  waterProgram: Program;
}

export interface ZoneProgram {
  id?: string | number;
  zoneId: string | number;
  duration: number;
  durationStr?: string;
  index: number;
  hydrawiseZone?: any;
}

export interface CreateProgramData {
  name: string;
  days: number;
  zoneWaterPrograms: ZoneProgram[];
  description?: string;
}

export interface UpdateProgramData extends Partial<CreateProgramData> {
  isActive?: boolean;
}
