export type ExpanseLike<T> = {
  normalize(x: T): number;
  unnormalize(x: number): T;
};
