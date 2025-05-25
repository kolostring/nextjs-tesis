import { createDIToken } from "@/ioc/common/utils";
import { TherapeuticActivity } from "../entities/TherapeuticActivity";
import { Result } from "@/common/types/Result";

export interface CreateTherapeuticActivityRequest {
  treatmentBlockId: string;
  name: string;
  description?: string;
  dayOfBlock: number;
  beginningHour: string; // TIME as string (HH:mm format)
  endHour: string; // TIME as string (HH:mm format)
}

export interface UpdateTherapeuticActivityRequest {
  id: string;
  treatmentBlockId?: string;
  name?: string;
  description?: string;
  dayOfBlock?: number;
  beginningHour?: string;
  endHour?: string;
}

export interface TherapeuticActivityRepository {
  add(activity: TherapeuticActivity): Promise<Result<void>>;
  listByTreatmentBlock(treatmentBlockId: string): Promise<Result<TherapeuticActivity[]>>;
  update(activity: TherapeuticActivity): Promise<Result<void>>;
  delete(id: string): Promise<Result<void>>;
  getById(id: string): Promise<Result<TherapeuticActivity>>;
  
  // Convenience methods with request objects
  createActivity(request: CreateTherapeuticActivityRequest): Promise<Result<TherapeuticActivity>>;
  updateActivity(request: UpdateTherapeuticActivityRequest): Promise<Result<TherapeuticActivity>>;
}

export const TherapeuticActivityRepository =
  createDIToken<TherapeuticActivityRepository>("TherapeuticActivityRepository"); 