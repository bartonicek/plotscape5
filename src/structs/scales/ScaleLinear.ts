import { ValueLike } from "../values/ValueLike";
import { Expanse } from "./Expanse";
import { ScaleLike } from "./ScaleLike";

export class ScaleLinear implements ScaleLike {
  constructor(
    public domain: Expanse,
    public norm: Expanse,
    public codomain: Expanse
  ) {}

  static default() {
    return new ScaleLinear(
      Expanse.default(),
      Expanse.default(),
      Expanse.default()
    );
  }

  pushforward(x: number) {
    const { domain, norm, codomain } = this;
    return codomain.unnormalize(norm.unnormalize(domain.normalize(x)));
  }

  pullback(x: number) {
    const { domain, norm, codomain } = this;
    return domain.unnormalize(norm.normalize(codomain.normalize(x)));
  }

  setDomain(lower: ValueLike<number>, upper: ValueLike<number>) {
    this.domain.lower = lower;
    this.domain.upper = upper;
    return this;
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

  breaks(n = 4) {
    const { domain, norm } = this;

    const [lower, upper] = [
      domain.unnormalize(norm.normalize(0)),
      domain.unnormalize(norm.normalize(1)),
    ];

    const unitGross = (upper - lower) / n;
    const base = Math.floor(Math.log10(unitGross));

    const candidateVals = [1, 2, 4, 5, 10];
    let [minDist, neatValue] = [Infinity, 0];

    for (let i = 0; i < candidateVals.length; i++) {
      const dist = (candidateVals[i] * 10 ** base - unitGross) ** 2;
      if (dist < minDist) [minDist, neatValue] = [dist, candidateVals[i]];
    }

    const unitNeat = 10 ** base * neatValue;

    const minNeat = Math.ceil(lower / unitNeat) * unitNeat;
    const maxNeat = Math.floor(upper / unitNeat) * unitNeat;

    const n2 = Math.round((maxNeat - minNeat) / unitNeat);
    const breaks = [parseFloat(minNeat.toFixed(4))];

    for (let i = 1; i < n2; i++) {
      const value = minNeat + i * unitNeat;
      breaks.push(parseFloat(value.toFixed(4)));
    }
    breaks.push(parseFloat(maxNeat.toFixed(4)));

    return breaks;
  }

  breakWidth = () => {
    const breaks = this.breaks();
    return this.pushforward(breaks[1]) - this.pushforward(breaks[0]);
  };
}
