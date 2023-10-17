import { ValueLike } from "./ValueLike";

export class Value<T> implements ValueLike<T> {
  constructor(private val: T) {}

  static of<T>(val: T) {
    return new Value(val);
  }

  value = () => {
    return this.val;
  };
}
