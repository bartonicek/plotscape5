import { Lazy } from "../utils/types";

export type ValueLike<T> = {
  value: () => T;
};

export class Value<T> implements ValueLike<T> {
  constructor(private val: T) {}
  static of = <T>(val: T) => new Value(val);
  value = () => this.val;
}

export class View<T> implements ValueLike<T> {
  constructor(private array: T[], private indexfn: Lazy<number>) {}
  static of = <T>(array: T[], index: Lazy<number>) => new View(array, index);
  value = () => this.array[this.indexfn()];
}
