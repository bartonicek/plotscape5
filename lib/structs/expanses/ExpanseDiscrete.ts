import { ref } from "../scalars/utils";
import { ValueLike } from "../values/ValueLike";
import { ExpanseLike } from "./ExpanseLike";

export class ExpanseDiscrete implements ExpanseLike<string> {
  constructor(public values: ValueLike<string[]>) {}

  static default() {
    return new ExpanseDiscrete(ref([]));
  }

  static of(values: ValueLike<string[]>) {
    return new ExpanseDiscrete(values);
  }

  setValues(values: ValueLike<string[]>) {
    this.values = values;
    return this;
  }

  normalize(x: string) {
    const values = this.values.value();
    return (values.indexOf(x) + 1) / (values.length + 1);
  }

  unnormalize(x: number) {
    const values = this.values.value();
    return values[Math.round(x * (values.length + 1)) - 1];
  }
}
