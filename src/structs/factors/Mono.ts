import { lazy, seq } from "../../utils/funs";
import { Lazy } from "../../utils/types";
import { Dataframe } from "../Dataframe";
import { positionsSymbol } from "../Symbols";
import { ref } from "../scalars/utils";
import { VariableLike } from "../variables/VariableLike";
import { FactorLike } from "./FactorLike";

export class Mono implements FactorLike<any> {
  constructor(private n: number) {}

  cardinality() {
    return 1;
  }

  *uniqueIndices() {
    yield 0;
  }

  *indices() {
    let i = 0;
    while (i < this.n) {
      yield 0;
      i++;
    }
  }

  data() {
    const push = lazy(1);
    const empty = () => {};
    const isOfLength = (n: number) => n === this.n;
    const ith = (indexfn: Lazy<number>) => {
      if (indexfn() === 0) return ref(new Set(seq(0, this.n)));
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
    return new Dataframe(1, { [positionsSymbol]: positions });
  }
}
