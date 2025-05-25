import { createDIToken } from "@/ioc/common/utils";
import { Patient } from "../entities/Patient";
import { Result } from "@/common/types/Result";
import { PatientUser } from "../entities/PatientUser";

export interface CreatePatientRequest {
  fullName: string;
  dateOfBirth?: Date;
  description?: string;
}

export interface UpdatePatientRequest {
  id: string;
  fullName?: string;
  dateOfBirth?: Date;
  description?: string;
}

export interface PatientRepository {
  getPatientById: (id: string) => Promise<Result<Patient>>;
  getPatientsList: (ids?: string[]) => Promise<Result<Patient[]>>;
  getPatientsByUser: (userId: string) => Promise<Result<Patient[]>>;
  createPatient: (request: CreatePatientRequest, userId: string) => Promise<Result<Patient>>;
  updatePatient: (request: UpdatePatientRequest) => Promise<Result<Patient>>;
  deletePatient: (id: string) => Promise<Result<void>>;
  
  // Patient-User association methods
  associatePatientWithUser: (patientId: string, userId: string) => Promise<Result<PatientUser>>;
  removePatientUserAssociation: (patientId: string, userId: string) => Promise<Result<void>>;
  getUserPatientsAssociations: (userId: string) => Promise<Result<PatientUser[]>>;
}

export const PatientRepository =
  createDIToken<PatientRepository>("PatientRepository");
