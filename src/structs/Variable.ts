import { alNumCompare, lazy, minMax, toString } from "../utils/funs";
import { Lazy, MapFn } from "../utils/types";
import { Factor } from "./Factor";
import { Num, Ref, ScalarLike, Str } from "./Scalar";
import { ValueLike, View } from "./Value";

export type VariableLike<T> = {
  meta?: Record<string, any>;

  empty(): void;
  ith(indexfn: Lazy<number>): ValueLike<T> | undefined;
  values: () => T[];
  push(scalar: ValueLike<T>): number;
  isOfLength: (n: number) => boolean;
};

export class NumVariable implements VariableLike<number> {
  meta: { min: number; max: number };

  constructor(private array: number[]) {
    const [min, max] = minMax(array);
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

export class StrVariable implements VariableLike<string> {
  array: string[];
  meta: { values: string[] };

  constructor(array: any[]) {
    this.array = array.map(toString);
    this.meta = { values: Array.from(new Set(this.array)).sort(alNumCompare) };
  }

  static from(array: any[]) {
    return new StrVariable(array);
  }

  empty = () => {
    this.array.length = 0;
    this.meta.values.length = 0;
  };

  values() {
    return this.array;
  }

  ith(indexfn: Lazy<number>) {
    return Str.of(View.of(this.array, indexfn));
  }

  push(str: Str) {
    const value = str.value();
    this.array.push(value);

    if (this.meta.values.indexOf(value) === -1) {
      this.meta.values.push(value);
      this.meta.values.sort(alNumCompare);
    }

    return this.array.length;
  }

  isOfLength(n: number) {
    return this.array.length === n;
  }

  factor(labels?: string[]) {
    return Factor.from(this.array, labels);
  }
}

export class RefVariable implements VariableLike<any> {
  constructor(private array: any[], public key?: string) {}
  static from = (array: any[]) => new RefVariable(array);

  empty() {
    this.array.length = 0;
  }

  values() {
    return this.array;
  }

  ith(indexfn: Lazy<number>) {
    return Ref.of(View.of(this.array, indexfn));
  }

  push(ref: Ref) {
    return this.array.push(ref.value());
  }

  isOfLength(n: number) {
    return this.array.length === n;
  }
}

export class TranslatedVariable<T> implements VariableLike<T> {
  meta?: Record<string, any>;

  constructor(
    private variable: VariableLike<T>,
    private translatefn: MapFn<Lazy<number>, Lazy<number>>
  ) {
    this.meta = this.variable.meta;
  }

  empty() {
    this.variable.empty();
  }

  ith(indexfn: Lazy<number>) {
    return this.variable.ith(this.translatefn(indexfn));
  }

  values() {
    return this.variable.values();
  }

  push(scalar: ScalarLike<T>) {
    return this.variable.push(scalar);
  }
  isOfLength(n: number) {
    return this.variable.isOfLength(n);
  }
}

export class ConstantVariable implements VariableLike<any> {
  private variable: VariableLike<any>;
  meta?: Record<string, any>;

  constructor(scalarLike: ScalarLike<any>, private index = 0) {
    this.variable = scalarLike.toVariable();
    this.meta = this.variable.meta;
  }

  static of(scalarLike: ScalarLike<any>) {
    return new ConstantVariable(scalarLike);
  }

  empty() {}

  ith() {
    return this.variable.ith(lazy(this.index));
  }

  values() {
    return [this.variable.ith(lazy(0))];
  }

  push() {
    return 1;
  }

  isOfLength() {
    return true;
  }
}
