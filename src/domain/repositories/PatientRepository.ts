import { createDIToken } from "@/ioc/common/utils";
import { Patient } from "../entities/Patient";
import { Result } from "@/common/types/Result";
import { Treatment } from "../entities/Treatment";
import { StrictOmit } from "@/common/types/StrictOmit";

export interface PatientRepository {
  getPatientById: (id: string) => Promise<Result<Patient>>;
  getPatientsList: (ids?: string[]) => Promise<Result<Patient[]>>;
  createPatient: (
    request: StrictOmit<Patient, "id" | "treatments">,
  ) => Promise<Result<Patient>>;
  updatePatient: (
    request: StrictOmit<Patient, "treatments">,
  ) => Promise<Result<Patient>>;
  deletePatient: (id: string) => Promise<Result<void>>;
  addTreatment: (
    patientId: string,
    treatment: Treatment,
  ) => Promise<Result<void>>;
  updateTreatment: (
    patientId: string,
    treatment: Treatment,
  ) => Promise<Result<void>>;
}

export const PatientRepository =
  createDIToken<PatientRepository>("PatientRepository");
