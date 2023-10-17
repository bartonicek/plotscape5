import { Accessor } from "solid-js";
import { ValueLike } from "./ValueLike";

export class Signal<T> implements ValueLike<T> {
  constructor(private getter: Accessor<T>) {}

  static of<T>(getter: Accessor<T>) {
    return new Signal(getter);
  }

  value = () => {
    return this.getter();
  };
}
