import { val } from "../values/utils";
import { ValueLike } from "../values/ValueLike";
import { ExpanseLike } from "./ExpanseLike";

export class ExpanseLinear implements ExpanseLike<number> {
  constructor(
    public lower: ValueLike<number>,
    public upper: ValueLike<number>
  ) {}

  static default() {
    return new ExpanseLinear(val(0), val(1));
  }

  static of(lower: ValueLike<number>, upper: ValueLike<number>) {
    return new ExpanseLinear(lower, upper);
  }

  setLimits(lower: ValueLike<number>, upper: ValueLike<number>) {
    this.lower = lower;
    this.upper = upper;
    return this;
  }

  range() {
    return this.upper.value() - this.lower.value();
  }

  normalize(x: number) {
    return (x - this.lower.value()) / this.range();
  }

  unnormalize(pct: number) {
    return pct * this.range() + this.lower.value();
  }
}
