import { minMax } from "../utils/funs";
import { Lazy, MapFn } from "../utils/types";
import { Factor } from "./Factor";
import { Num, Ref, ScalarLike, Str } from "./Scalar";
import { ValueLike, View } from "./Value";

export type VariableLike<T> = {
  meta?: Record<string, any>;
  empty(): void;
  ith(indexfn: Lazy<number>): ValueLike<T> | undefined;
  push(scalar: ValueLike<T>): number;
  isOfLength: (n: number) => boolean;
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

  isOfLength = (n: number) => this.array.length === n;

  bin = (width: ValueLike<number>, anchor: ValueLike<number>) => {
    return Factor.bin(this.array, width.value(), anchor.value());
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

  isOfLength = (n: number) => this.array.length === n;

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

  isOfLength = (n: number) => this.array.length === n;
}

export class TranslatedVariable<T> implements VariableLike<T> {
  meta?: Record<string, any>;

  constructor(
    private variable: VariableLike<T>,
    private translatefn: MapFn<Lazy<number>, Lazy<number>>
  ) {
    this.meta = this.variable.meta;
  }

  empty = () => this.variable.empty();
  ith = (indexfn: Lazy<number>) => {
    return this.variable.ith(this.translatefn(indexfn));
  };
  push = (scalar: ScalarLike<T>) => this.variable.push(scalar);

  isOfLength = (n: number) => this.variable.isOfLength(n);
}

export class ConstantVariable implements VariableLike<any> {
  variable: VariableLike<any>;
  meta?: Record<string, any>;

  constructor(scalarLike: ScalarLike<any>) {
    this.variable = scalarLike.toVariable();
    this.meta = this.variable.meta;
  }

  static of = (scalarLike: ScalarLike<any>) => new ConstantVariable(scalarLike);

  empty = () => {};
  ith = () => this.variable.ith(() => 0);
  push = () => 1;

  isOfLength = () => true;
}
