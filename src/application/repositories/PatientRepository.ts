import { createDIToken } from "@/ioc/common/utils";
import { Patient } from "../../domain/entities/Patient";
import { Result } from "@/common/types/Result";
import { Treatment } from "../../domain/entities/Treatment";
import { DTOPatientUpdateRequest } from "../dtos/DTOPatientUpdateRequest";
import { DTOPatientCreateRequest } from "../dtos/DTOPatientCreateRequest";

export interface PatientRepository {
  getPatientById: (id: string) => Promise<Result<Patient>>;
  getAllPatients: (ids?: string[]) => Promise<Result<Patient[]>>;
  createPatient: (request: DTOPatientCreateRequest) => Promise<Result<Patient>>;
  updatePatient: (request: DTOPatientUpdateRequest) => Promise<Result<Patient>>;
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
