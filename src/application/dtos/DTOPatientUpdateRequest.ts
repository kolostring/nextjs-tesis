import { StrictOmit } from "@/common/types/StrictOmit";
import { Patient } from "@/domain/entities/Patient";

export type DTOPatientUpdateRequest = StrictOmit<Patient, "id" | "treatments">;
