export type StrictOmit<T, K> = {
  [P in keyof T as Exclude<P, K & keyof any>]: T[P];
};
