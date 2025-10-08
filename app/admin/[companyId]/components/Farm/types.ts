export interface Program {
  id: string;
  name: string;
  totalDays: number;
  remainingDays?: number;
  isActive: boolean;
  nextScheduledRun?: Date;
  zones: string[];
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ZoneProgram {
  uid?: string;
  zoneId: string | number;
  duration: number;
  durationStr?: string;
  index: number;
}

export interface CreateProgramData {
  name: string;
  totalDays: number;
  zones: string[];
  description?: string;
}

export interface UpdateProgramData extends Partial<CreateProgramData> {
  isActive?: boolean;
}
