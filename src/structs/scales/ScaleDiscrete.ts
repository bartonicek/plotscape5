import { ExpanseDiscrete } from "./ExpanseDiscrete";
import { ExpanseLinear } from "./ExpanseLinear";
import { ScaleLike } from "./ScaleLike";

export class ScaleDiscrete implements ScaleLike {
  constructor(
    public domain: ExpanseDiscrete,
    public norm: ExpanseLinear,
    public codomain: ExpanseLinear
  ) {}

  static default() {
    return new ScaleDiscrete(
      ExpanseDiscrete.default(),
      ExpanseLinear.default(),
      ExpanseLinear.default()
    );
  }

  pushforward(x: string) {
    const { domain, norm, codomain } = this;
    return codomain.unnormalize(norm.unnormalize(domain.normalize(x)));
  }

  pullback(x: number) {
    const { domain, norm, codomain } = this;
    return domain.unnormalize(norm.normalize(codomain.normalize(x)));
  }

  setDomain(domain: ExpanseDiscrete) {
    this.domain = domain;
    return this;
  }

  setNorm = (norm: ExpanseLinear) => {
    this.norm = norm;
    return this;
  };

  setCodomain(codomain: ExpanseLinear) {
    this.codomain = codomain;
    return this;
  }

  breaks() {
    return this.domain.values.value();
  }

  breakWidth() {
    const breaks = this.breaks();
    return this.pushforward(breaks[1]) - this.pushforward(breaks[0]);
  }
}
