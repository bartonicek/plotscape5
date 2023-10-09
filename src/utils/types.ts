import { ScalarLike } from "../structs/Scalar";
import { VariableLike } from "../structs/Variable";

export type MapFn<T, U> = (next: T) => U;
export type ReduceFn<T, U> = (prev: U, next: T) => U;

export type Lazy<T> = () => T;
export type Stringable = { toString(): string };

export type Key = string | number | symbol;

export type Cols = Record<Key, VariableLike<any>>;
export type Row = Record<Key, ScalarLike<any>>;

export type ScalarOf<T extends VariableLike<any>> = T extends VariableLike<
  infer U
>
  ? ScalarLike<U>
  : never;
