import { ref } from "../scalars/utils";
import { ValueLike } from "../values/ValueLike";
import { Expanse } from "./Expanse";
import { ScaleLike } from "./ScaleLike";

export class ScaleDiscrete implements ScaleLike {
  constructor(
    public values: ValueLike<string[]>,
    public norm: Expanse,
    public codomain: Expanse
  ) {}

  static default() {
    return new ScaleDiscrete(ref([]), Expanse.default(), Expanse.default());
  }

  pushforward(x: string) {
    const { values, norm, codomain } = this;

    const vals = values.value();
    const pct = (vals.indexOf(x) + 1) / (vals.length + 1);

    return codomain.unnormalize(norm.unnormalize(pct));
  }

  pullback(x: number) {
    const { values, norm, codomain } = this;

    const vals = values.value();
    const pct = norm.normalize(codomain.normalize(x));

    return vals[Math.round(pct * (vals.length + 1)) - 1];
  }

  setValues(values: ValueLike<string[]>) {
    this.values = values;
    return this;
  }

  setNorm = (lower: ValueLike<number>, upper: ValueLike<number>) => {
    this.norm.lower = lower;
    this.norm.upper = upper;
    return this;
  };

  setCodomain(lower: ValueLike<number>, upper: ValueLike<number>) {
    this.codomain.lower = lower;
    this.codomain.upper = upper;
    return this;
  }

  breaks() {
    return this.values.value();
  }

  breakWidth() {
    const breaks = this.breaks();
    return this.pushforward(breaks[1]) - this.pushforward(breaks[0]);
  }
}
