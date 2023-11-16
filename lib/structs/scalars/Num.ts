import { ValueLike } from "../values/ValueLike";
import { NumVariable } from "../variables/NumVariable";
import { ScalarLike } from "./ScalarLike";
import { num } from "./utils";

export class Num implements ScalarLike<number> {
  constructor(private valueLike: ValueLike<number>) {}

  static of(valueLike: ValueLike<number>) {
    return new Num(valueLike);
  }

  value() {
    return this.valueLike.value();
  }

  toVariable() {
    return NumVariable.from([this.value()]);
  }

  inc() {
    return num(this.value() + 1);
  }

  dec() {
    return num(this.value() - 1);
  }

  add(other: Num) {
    return num(this.value() + other.value());
  }

  minus(other: Num) {
    return num(this.value() - other.value());
  }

  times(other: Num) {
    return num(this.value() * other.value());
  }

  divideBy(other: Num) {
    return num(this.value() / other.value());
  }
}
