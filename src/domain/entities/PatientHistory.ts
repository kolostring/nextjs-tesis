import { Note } from "./Note";

export type PatientHistory = {
  id: string;
  patientId: string;
  notes: Note[];
};
