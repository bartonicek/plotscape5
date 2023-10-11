import { minMax } from "../utils/funs";
import { Lazy, MapFn } from "../utils/types";
import { Factor } from "./Factor";
import { Num, Ref, ScalarLike, Str, num } from "./Scalar";
import { ValueLike, View } from "./Value";

export type VariableLike<T> = {
  empty(): void;
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

  empty = () => {
    this.array.length = 0;
    this.meta.min = Infinity;
    this.meta.max = -Infinity;
  };

  ith = (indexfn: Lazy<number>) => {
    return Num.of(View.of(this.array, indexfn));
  };

  push = (num: Num) => {
    const value = num.value();
    this.array.push(value);
    this.meta.min = Math.min(this.meta.min, value);
    this.meta.max = Math.max(this.meta.max, value);
    return this.array.length;
  };
}

export class StrVariable implements VariableLike<string> {
  meta: { values: Set<string> };

  constructor(private array: string[]) {
    this.meta = { values: new Set(array) };
  }

  static from = (array: string[]) => new StrVariable(array);

  empty = () => {
    this.array.length = 0;
    this.meta.values = new Set();
  };

  ith = (indexfn: Lazy<number>) => {
    return Str.of(View.of(this.array, indexfn));
  };

  push = (str: Str) => {
    const value = str.value();
    this.array.push(value);
    this.meta.values.add(value);
    return this.array.length;
  };

  factor = () => Factor.from(this.array);
}

export class RefVariable implements VariableLike<any> {
  constructor(private array: any[]) {}
  static from = (array: any[]) => new RefVariable(array);

  empty = () => {
    this.array.length = 0;
  };

  ith = (indexfn: Lazy<number>) => Ref.of(View.of(this.array, indexfn));
  push = (ref: Ref) => this.array.push(ref.value());
}

export class TranslatedVariable<T> implements VariableLike<T> {
  constructor(
    private variable: VariableLike<T>,
    private translatefn: MapFn<Lazy<number>, Lazy<number>>
  ) {}

  empty = () => this.variable.empty();
  ith = (indexfn: Lazy<number>) => {
    return this.variable.ith(this.translatefn(indexfn));
  };
  push = (scalar: ScalarLike<T>) => this.variable.push(scalar);
}

export class NumConstant implements VariableLike<number> {
  value: Num;

  constructor(value: number) {
    this.value = num(value);
  }

  static of = (value: number) => new NumConstant(value);

  empty = () => {};
  ith = () => this.value;
  push = () => 1;
}
