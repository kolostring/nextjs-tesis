export type StrictOmit<T, K> = {
  [P in keyof T as Exclude<P, K & keyof T>]: T[P];
};
