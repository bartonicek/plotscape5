import { ValueLike } from "../values/ValueLike";
import { RefVariable } from "../variables/RefVariable";
import { ScalarLike } from "./ScalarLike";

export class Ref implements ScalarLike<any> {
  constructor(private valueLike: ValueLike<any>) {}

  static of(valueLike: ValueLike<any>) {
    return new Ref(valueLike);
  }

  value() {
    return this.valueLike.value();
  }

  toVariable() {
    return RefVariable.from([this.value()]);
  }
}
