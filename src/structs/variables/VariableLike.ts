import { Lazy } from "../../utils/types";
import { ValueLike } from "../values/ValueLike";

export type VariableLike<T> = {
  name: string | undefined;
  meta: Record<string, any> | undefined;

  empty(): void;
  ith(indexfn: Lazy<number>): ValueLike<T> | undefined;
  values: () => T[];
  push(scalar: ValueLike<T>): number;
  isOfLength: (n: number) => boolean;
};
