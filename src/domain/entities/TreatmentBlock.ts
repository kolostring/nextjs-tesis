import { TherapeuticActivity } from "./TherapeuticActivity";

export type TreatmentBlock = {
  beginningDay: Date;
  durationDays: number;
  iterations: number;
  therapeuticActivities: TherapeuticActivity[];
};
