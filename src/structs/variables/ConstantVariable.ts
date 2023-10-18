import { lazy } from "../../utils/funs";
import { ScalarLike } from "../scalars/ScalarLike";
import { VariableLike } from "./VariableLike";

export class ConstantVariable implements VariableLike<any> {
  private variable: VariableLike<any>;
  name: string | undefined;
  meta?: Record<string, any>;

  constructor(scalarLike: ScalarLike<any>, options?: { name?: string }) {
    this.name = options?.name;
    this.variable = scalarLike.toVariable();
    this.meta = this.variable.meta;
  }

  static from(scalarLike: ScalarLike<any>, options?: { name?: string }) {
    return new ConstantVariable(scalarLike);
  }

  empty() {}

  ith() {
    return this.variable.ith(lazy(0));
  }

  values() {
    return this.variable.values();
  }

  push() {
    return 1;
  }

  isOfLength() {
    return true;
  }
}
