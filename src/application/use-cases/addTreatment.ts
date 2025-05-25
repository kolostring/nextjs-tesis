import { TreatmentRepository } from "@/domain/repositories/TreatmentRepository";
import { Treatment, TreatmentProps } from "@/domain/entities/Treatment";
import { Result } from "@/common/types/Result";

export const addTreatment =
  (repo: TreatmentRepository) =>
  async (data: TreatmentProps): Promise<Result<void>> => {
    const treatment = new Treatment(data);
    return repo.add(treatment);
  }; 