import { identity } from "../../utils/funs";
import { MapFn } from "../../utils/types";
import { val } from "../values/utils";
import { ValueLike } from "../values/ValueLike";
import { ExpanseLike } from "./ExpanseLike";

export class ExpanseTransformed implements ExpanseLike<number> {
  constructor(
    public lower: ValueLike<number>,
    public upper: ValueLike<number>,
    private trans: MapFn<number, number>
  ) {}

  static default() {
    return new ExpanseTransformed(val(0), val(1), identity);
  }

  static of(
    lower: ValueLike<number>,
    upper: ValueLike<number>,
    trans: MapFn<number, number>
  ) {
    return new ExpanseTransformed(lower, upper, trans);
  }

  setLimits(lower: ValueLike<number>, upper: ValueLike<number>) {
    this.lower = lower;
    this.upper = upper;
    return this;
  }

  range() {
    return this.trans(this.upper.value()) - this.trans(this.lower.value());
  }

  normalize(x: number) {
    return (this.trans(x) - this.trans(this.lower.value())) / this.range();
  }

  unnormalize(pct: number) {
    return pct * this.range() + this.lower.value();
  }
}
