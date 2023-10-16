import { ValueLike } from "../values/ValueLike";
import { Expanse } from "./Expanse";
import { ScaleDiscrete } from "./ScaleDiscrete";
import { ScaleLike } from "./ScaleLike";
import { ScaleLinear } from "./ScaleLinear";

export class ScalePlaceholder implements ScaleLike {
  constructor(public norm: Expanse, public codomain: Expanse) {}

  static default() {
    return new ScalePlaceholder(Expanse.default(), Expanse.default());
  }

  setNorm(lower: ValueLike<number>, upper: ValueLike<number>) {
    this.norm.lower = lower;
    this.norm.upper = upper;
    return this;
  }

  setCodomain(lower: ValueLike<number>, upper: ValueLike<number>) {
    this.codomain.lower = lower;
    this.codomain.upper = upper;
    return this;
  }

  setDomain(lower: ValueLike<number>, upper: ValueLike<number>) {
    return new ScaleLinear(new Expanse(lower, upper), this.norm, this.codomain);
  }

  setValues(values: ValueLike<string[]>) {
    return new ScaleDiscrete(values, this.norm, this.codomain);
  }

  pushforward() {
    return 0;
  }

  pullback() {
    return undefined;
  }

  breaks() {
    return [];
  }

  breakWidth() {
    return 0;
  }
}
