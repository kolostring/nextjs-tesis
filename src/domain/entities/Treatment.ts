import { TreatmentBlock } from "./TreatmentBlock";

export type Treatment = {
  id: string;
  eyeCondition: string;
  name: string;
  description?: string;
  treatmentBlocks: TreatmentBlock[];
};
