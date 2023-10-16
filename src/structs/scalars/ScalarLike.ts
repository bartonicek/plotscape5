import { ValueLike } from "../values/ValueLike";
import { VariableLike } from "../variables/VariableLike";

export type ScalarLike<T> = ValueLike<T> & {
  toVariable(): VariableLike<T>;
};
