import { lazy } from "../../utils/funs";
import { ScalarLike } from "../scalars/ScalarLike";
import { VariableLike } from "./VariableLike";

export class ConstantVariable implements VariableLike<any> {
  private variable: VariableLike<any>;
  meta?: Record<string, any>;

  constructor(scalarLike: ScalarLike<any>, private index = 0) {
    this.variable = scalarLike.toVariable();
    this.meta = this.variable.meta;
  }

  static from(scalarLike: ScalarLike<any>) {
    return new ConstantVariable(scalarLike);
  }

  empty() {}

  ith() {
    return this.variable.ith(lazy(this.index));
  }

  values() {
    return [this.variable.ith(lazy(0))];
  }

  push() {
    return 1;
  }

  isOfLength() {
    return true;
  }
}
