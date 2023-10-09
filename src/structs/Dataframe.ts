import { allKeys, unwrapAll } from "../utils/funs";
import { Cols, Lazy, ScalarOf } from "../utils/types";

export class Dataframe<T extends Cols> {
  private keys: (keyof T)[];

  constructor(public n: number, public cols: T) {
    this.keys = allKeys(cols);
  }

  row = (indexfn: Lazy<number>) => {
    const result = {} as { [key in keyof T]: ScalarOf<T[key]> };
    for (const k of this.keys) result[k] = this.cols[k].ith(indexfn) as any;
    return result;
  };

  unwrapRow = (indexfn: Lazy<number>) => unwrapAll(this.row(indexfn));
  unwrapRows = () => {
    const result = [] as any[];
    for (let i = 0; i < this.n; i++) result.push(this.unwrapRow(() => i));
    return result;
  };
}
