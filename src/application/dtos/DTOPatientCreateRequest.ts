import { StrictOmit } from "@/common/types/StrictOmit";
import { Patient } from "@/domain/entities/Patient";

export type DTOPatientCreateRequest = StrictOmit<Patient, "id" | "treatments">;
