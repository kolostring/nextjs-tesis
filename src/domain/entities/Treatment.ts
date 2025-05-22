import { TreatmentBlock } from "./TreatmentBlockt";

export type Treatment = {
  id: string;
  eyeCondition: string;
  treatmentName: string;
  description?: string;
  treatmentBlocks: TreatmentBlock[];
};
