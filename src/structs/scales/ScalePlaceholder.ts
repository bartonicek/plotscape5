import { ExpanseDiscrete } from "./ExpanseDiscrete";
import { ExpanseLinear } from "./ExpanseLinear";
import { ScaleDiscrete } from "./ScaleDiscrete";
import { ScaleLike } from "./ScaleLike";
import { ScaleLinear } from "./ScaleLinear";

export class ScalePlaceholder implements ScaleLike {
  constructor(public norm: ExpanseLinear, public codomain: ExpanseLinear) {}

  static default() {
    return new ScalePlaceholder(
      ExpanseLinear.default(),
      ExpanseLinear.default()
    );
  }

  setNorm(norm: ExpanseLinear) {
    this.norm = norm;
    return this;
  }

  setCodomain(codomain: ExpanseLinear) {
    this.codomain = codomain;
    return this;
  }

  setLimits(domain: ExpanseLinear) {
    return new ScaleLinear(domain, this.norm, this.codomain);
  }

  setValues(values: ExpanseDiscrete) {
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
