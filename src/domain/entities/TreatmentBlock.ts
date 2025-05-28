import { TherapeuticActivity } from "./TherapeuticActivity";

export type TreatmentBlock = {
  beginningDate: Date;
  durationDays: number;
  iterations: number;
  therapeuticActivities: TherapeuticActivity[];
};
