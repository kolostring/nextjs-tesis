import { PatientRepository } from "@/domain/repositories/PatientRepository";

export default function getAllPatients(patientRepository: PatientRepository) {
  return (ids: string[]) => {
    return patientRepository.getPatientsList(ids);
  };
}
