import { minMax } from "../utils/funs";
import { Lazy, MapFn } from "../utils/types";
import { Num, Ref, Str, num } from "./Scalar";
import { ValueLike, View } from "./Value";

export type VariableLike<T> = {
  ith(indexfn: Lazy<number>): ValueLike<T> | undefined;
  push(scalar: ValueLike<T>): number;
};

export class NumVariable implements VariableLike<number> {
  meta: { min: number; max: number };

  constructor(private array: number[]) {
    const [min, max] = minMax(array);
    this.meta = { min, max };
  }
  static from = (array: number[]) => new NumVariable(array);

  ith = (indexfn: Lazy<number>) => {
    return Num.of(View.of(this.array, indexfn));
  };

  push = (num: Num) => this.array.push(num.value());
}

export class StrVariable implements VariableLike<string> {
  meta: { values: string[] };

  constructor(private array: string[]) {
    this.meta = { values: Array.from(new Set(array)).sort() };
  }

  static from = (array: string[]) => new StrVariable(array);

  ith = (indexfn: Lazy<number>) => {
    return Str.of(View.of(this.array, indexfn));
  };

  push = (str: Str) => this.array.push(str.value());
}

export class RefVariable implements VariableLike<object> {
  constructor(private array: object[]) {}
  static from = (array: object[]) => new RefVariable(array);

  ith = (indexfn: Lazy<number>) => Ref.of(View.of(this.array, indexfn));
  push = (ref: Ref) => this.array.push(ref.value());
}

export class TranslatedVariable<T> implements VariableLike<T> {
  constructor(
    private variable: VariableLike<T>,
    private translatefn: MapFn<Lazy<number>, Lazy<number>>
  ) {}

  ith = (indexfn: Lazy<number>) => this.variable.ith(this.translatefn(indexfn));
  push = () => 1;
}

export class NumConstant implements VariableLike<number> {
  value: Num;
  constructor(value: number) {
    this.value = num(value);
  }
  static of = (value: number) => new NumConstant(value);

  ith = () => this.value;
  push = () => 1;
}
