import { lazy } from "../../utils/funs";
import { Lazy } from "../../utils/types";
import { Dataframe } from "../Dataframe";
import { positionsSymbol } from "../Symbols";
import { ref } from "../scalars/utils";
import { VariableLike } from "../variables/VariableLike";
import { FactorLike } from "./FactorLike";

export class Iso implements FactorLike<any> {
  constructor(private n: number) {}

  cardinality() {
    return this.n;
  }

  *uniqueIndices() {
    let i = 0;
    while (i < this.n) yield i++;
  }

  *indices() {
    yield* this.uniqueIndices();
  }

  data() {
    const push = lazy(this.n);
    const empty = () => {};
    const isOfLength = (n: number) => n === this.n;
    const ith = (indexfn: Lazy<number>) => {
      if (indexfn() < this.n) return ref(new Set([indexfn()]));
    };
    const values = () => {
      const result = Array(this.n);
      for (let i = 0; i < this.n; i++) result[i] = ith(lazy(i));
      return result;
    };

    const positions: VariableLike<object> = {
      ith,
      push,
      values,
      empty,
      isOfLength,
    };
    return new Dataframe(this.n, { [positionsSymbol]: positions });
  }
}
