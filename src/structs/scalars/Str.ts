import { ValueLike } from "../values/ValueLike";
import { StrVariable } from "../variables/StrVariable";
import { ScalarLike } from "./ScalarLike";

export class Str implements ScalarLike<string> {
  constructor(private valueLike: ValueLike<string>) {}

  static of(valueLike: ValueLike<string>) {
    return new Str(valueLike);
  }

  value() {
    return this.valueLike.value();
  }

  toVariable() {
    return StrVariable.from([this.value()]);
  }
}
