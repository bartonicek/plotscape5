import { Accessor } from "solid-js";
import { Lazy } from "../utils/types";

export type ValueLike<T> = {
  value: () => T;
};

export const val = <T>(x: T) => new Value(x);
export const sig = <T>(getter: Accessor<T>) => new Signal(getter);
export const view = <T>(array: T[], indexfn: Lazy<number>) => {
  return new View(array, indexfn);
};

export class Value<T> implements ValueLike<T> {
  constructor(private val: T) {}
  static of = <T>(val: T) => new Value(val);
  value = () => this.val;
}

export class Signal<T> implements ValueLike<T> {
  constructor(private getter: Accessor<T>) {}
  static of = <T>(getter: Accessor<T>) => new Signal(getter);
  value = () => this.getter();
}

export class View<T> implements ValueLike<T> {
  constructor(private array: T[], private indexfn: Lazy<number>) {}
  static of = <T>(array: T[], index: Lazy<number>) => new View(array, index);
  value = () => this.array[this.indexfn()];
}
