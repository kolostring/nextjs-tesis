import { Treatment } from "./Treatment";

export type Patient = {
  id: string;
  fullName: string;
  dateOfBirth?: Date;
  description?: string;
  treatments: Treatment[];
};
