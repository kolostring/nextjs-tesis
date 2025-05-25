import { TreatmentRepository } from "@/domain/repositories/TreatmentRepository";
import { Treatment } from "@/domain/entities/Treatment";
import { Result } from "@/common/types/Result";

export const getTreatmentsByPatient =
  (repo: TreatmentRepository) =>
  async (patientId: string): Promise<Result<Treatment[]>> => {
    return repo.listByPatient(patientId);
  }; 