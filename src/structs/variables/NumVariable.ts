import { minMax } from "../../utils/funs";
import { Lazy } from "../../utils/types";
import { Factor } from "../factors/Factor";
import { Num } from "../scalars/Num";
import { ValueLike } from "../values/ValueLike";
import { View } from "../values/View";
import { VariableLike } from "./VariableLike";

export class NumVariable implements VariableLike<number> {
  name: string | undefined;
  meta: { min: number; max: number };

  constructor(private array: number[], options?: { name?: string }) {
    const [min, max] = minMax(array);
    this.name = options?.name;
    this.meta = { min, max };
  }

  static from(array: number[]) {
    return new NumVariable(array);
  }

  empty() {
    this.array.length = 0;
    this.meta.min = Infinity;
    this.meta.max = -Infinity;
  }

  values() {
    return this.array;
  }

  ith(indexfn: Lazy<number>) {
    return Num.of(View.of(this.array, indexfn));
  }

  push(num: Num) {
    const value = num.value();
    this.array.push(value);
    this.meta.min = Math.min(this.meta.min, value);
    this.meta.max = Math.max(this.meta.max, value);
    return this.array.length;
  }

  isOfLength(n: number) {
    return this.array.length === n;
  }

  bin(width: ValueLike<number>, anchor: ValueLike<number>) {
    return Factor.bin(this.array, width.value(), anchor.value());
  }
}
