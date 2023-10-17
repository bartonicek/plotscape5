import { asString, compareAlNum } from "../../utils/funs";
import { Lazy } from "../../utils/types";
import { Factor } from "../factors/Factor";
import { Str } from "../scalars/Str";
import { View } from "../values/View";
import { VariableLike } from "./VariableLike";

const defaultOptions = { sort: true };

export class StrVariable implements VariableLike<string> {
  array: string[];
  name: string | undefined;
  meta: { values: string[] };

  constructor(array: any[], options?: { name?: string; sort?: boolean }) {
    options = { ...defaultOptions, ...options };

    this.array = array.map(asString);
    this.name = options?.name;
    this.meta = { values: Array.from(new Set(this.array)) };
    if (options.sort) this.meta.values.sort(compareAlNum);
  }

  static from(array: any[], options?: { name?: string; sort?: boolean }) {
    return new StrVariable(array, options);
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
      this.meta.values.sort(compareAlNum);
    }

    return this.array.length;
  }

  isOfLength(n: number) {
    return this.array.length === n;
  }

  factor(labels?: string[]) {
    return Factor.from(this, labels);
  }
}
