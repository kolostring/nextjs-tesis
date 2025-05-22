export type StrictPick<T, K extends keyof T> = {
  [P in keyof T as K & P]: T[P];
};
