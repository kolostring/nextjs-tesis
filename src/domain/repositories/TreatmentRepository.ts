import { createDIToken } from "@/ioc/common/utils";
import { Treatment } from "../entities/Treatment";
import { Result } from "@/common/types/Result";

export interface CreateTreatmentRequest {
  patientId: string;
  eyeCondition: string;
  name: string;
  description?: string;
}

export interface UpdateTreatmentRequest {
  id: string;
  patientId?: string;
  eyeCondition?: string;
  name?: string;
  description?: string;
}

export interface TreatmentRepository {
  add(treatment: Treatment): Promise<Result<void>>;
  listByPatient(patientId: string): Promise<Result<Treatment[]>>;
  update(treatment: Treatment): Promise<Result<void>>;
  delete(id: string): Promise<Result<void>>;
  getById(id: string): Promise<Result<Treatment>>;
  
  // Convenience methods with request objects
  createTreatment(request: CreateTreatmentRequest): Promise<Result<Treatment>>;
  updateTreatment(request: UpdateTreatmentRequest): Promise<Result<Treatment>>;
}

export const TreatmentRepository =
  createDIToken<TreatmentRepository>("TreatmentRepository"); 