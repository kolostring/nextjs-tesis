import { createDIToken } from "@/ioc/common/utils";
import { TreatmentBlock } from "../entities/TreatmentBlock";
import { Result } from "@/common/types/Result";

export interface CreateTreatmentBlockRequest {
  treatmentId: string;
  beginningDate: Date;
  durationDays: number;
  iterations: number;
}

export interface UpdateTreatmentBlockRequest {
  id: string;
  treatmentId?: string;
  beginningDate?: Date;
  durationDays?: number;
  iterations?: number;
}

export interface TreatmentBlockRepository {
  add(treatmentBlock: TreatmentBlock): Promise<Result<void>>;
  listByTreatment(treatmentId: string): Promise<Result<TreatmentBlock[]>>;
  update(treatmentBlock: TreatmentBlock): Promise<Result<void>>;
  delete(id: string): Promise<Result<void>>;
  getById(id: string): Promise<Result<TreatmentBlock>>;
  
  // Convenience methods with request objects
  createTreatmentBlock(request: CreateTreatmentBlockRequest): Promise<Result<TreatmentBlock>>;
  updateTreatmentBlock(request: UpdateTreatmentBlockRequest): Promise<Result<TreatmentBlock>>;
}

export const TreatmentBlockRepository =
  createDIToken<TreatmentBlockRepository>("TreatmentBlockRepository"); 