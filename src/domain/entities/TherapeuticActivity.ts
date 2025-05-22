export type TherapeuticActivity = {
  name: string;
  description: string;
  dayOfBlock: number;
  beginningHour: `${number}:${number}`;
  endHour: `${number}:${number}`;
};
