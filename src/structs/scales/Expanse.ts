import { val } from "../values/utils";
import { ValueLike } from "../values/ValueLike";

export class Expanse {
  constructor(
    public lower: ValueLike<number>,
    public upper: ValueLike<number>
  ) {}

  static default() {
    return new Expanse(val(0), val(1));
  }

  setSignals(lower: ValueLike<number>, upper: ValueLike<number>) {
    this.lower = lower;
    this.upper = upper;
    return this;
  }

  range = () => {
    return this.upper.value() - this.lower.value();
  };

  normalize = (x: number) => {
    return (x - this.lower.value()) / this.range();
  };

  unnormalize = (pct: number) => {
    return pct * this.range() + this.lower.value();
  };
}
