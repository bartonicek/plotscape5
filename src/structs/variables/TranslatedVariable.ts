import { Lazy, MapFn } from "../../utils/types";
import { ScalarLike } from "../scalars/ScalarLike";
import { VariableLike } from "./VariableLike";

export class TranslatedVariable<T> implements VariableLike<T> {
  name: string | undefined;
  meta: Record<string, any> | undefined;

  constructor(
    private variable: VariableLike<T>,
    private translatefn: MapFn<Lazy<number>, Lazy<number>>
  ) {
    this.name = this.variable.name;
    this.meta = this.variable.meta;
  }

  static from<T>(
    variable: VariableLike<T>,
    translatefn: MapFn<Lazy<number>, Lazy<number>>
  ) {
    return new TranslatedVariable(variable, translatefn);
  }

  empty() {
    this.variable.empty();
  }

  ith(indexfn: Lazy<number>) {
    return this.variable.ith(this.translatefn(indexfn));
  }

  values() {
    return this.variable.values();
  }

  push(scalar: ScalarLike<T>) {
    return this.variable.push(scalar);
  }
  isOfLength(n: number) {
    return this.variable.isOfLength(n);
  }
}
