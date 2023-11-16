import { Lazy } from "../../utils/types";
import { ValueLike } from "./ValueLike";

export class View<T> implements ValueLike<T> {
  constructor(private array: T[], private indexfn: Lazy<number>) {}

  static of<T>(array: T[], index: Lazy<number>) {
    return new View(array, index);
  }

  value() {
    return this.array[this.indexfn()];
  }
}
