import { allEntries, allKeys, unwrapAll } from "../utils/funs";
import {
  Cols,
  Key,
  Lazy,
  MapFn,
  Row,
  RowOf,
  ScalarOf,
  VariableOf,
} from "../utils/types";
import { SlidingRow } from "./SlidingRow";
import {
  NumVariable,
  RefVariable,
  StrVariable,
  VariableLike,
} from "./Variable";

const colConstructorMap = {
  numeric: NumVariable,
  discrete: StrVariable,
  reference: RefVariable,
};
type ColConstructorMap = typeof colConstructorMap;
type ColTypeMap = {
  [key in keyof ColConstructorMap]: InstanceType<ColConstructorMap[key]>;
};

type ColType = "numeric" | "discrete" | "reference";
export type ColScheme<K extends string> = Record<K, ColType>;

export class Dataframe<T extends Cols> {
  private keys: Set<keyof T>;

  constructor(public n: number, public cols: T) {
    this.keys = new Set(allKeys(cols));
  }

  static from = <T extends Cols>(n: number, cols: T) => new Dataframe(n, cols);

  static fromRows = <T extends Row>(rows: T[]) => {
    const cols = {} as { [key in keyof T]: VariableOf<T[key]> };

    for (const k of allKeys(rows[0])) {
      if (rows[0][k]) {
        cols[k] = rows[0][k].toVariable() as VariableOf<T[typeof k]>;
      }
    }

    const result = new Dataframe(1, cols);
    for (let i = 1; i < rows.length; i++) result.push(rows[i] as any);

    return result;
  };

  static parseCols = <
    U extends Record<string, any[]>,
    V extends ColScheme<string>
  >(
    unparsed: U,
    spec: V
  ) => {
    const cols = {} as { [key in keyof V]: ColTypeMap[V[key]] };

    for (const [k, v] of allEntries(spec)) {
      cols[k] = new colConstructorMap[v](
        unparsed[k as keyof U],
        k as string
      ) as any;
    }

    return Dataframe.from(Object.values(unparsed)[0].length, cols);
  };

  empty = () => {
    for (const k of allKeys(this.cols)) this.cols[k].empty();
    this.n = 0;
    return this;
  };

  row = (indexfn: Lazy<number>) => {
    const result = {} as { [key in keyof T]: ScalarOf<T[key]> };
    for (const k of this.keys) result[k] = this.cols[k].ith(indexfn) as any;
    return result;
  };

  rows = () => {
    const result = [] as RowOf<T>[];
    for (let i = 0; i < this.n; i++) result.push(this.row(() => i));
    return result;
  };

  push = (row: RowOf<T>) => {
    for (const k of allKeys(this.cols)) this.cols[k].push(row[k]);
    return this.n++;
  };

  unwrapRow = (indexfn: Lazy<number>) => unwrapAll(this.row(indexfn));
  unwrapRows = () => {
    const result = [] as any[];
    for (let i = 0; i < this.n; i++) result.push(this.unwrapRow(() => i));
    return result;
  };

  select = <U extends Record<Key, VariableLike<any>>>(
    selectfn: MapFn<T, U>
  ) => {
    const cols = selectfn(this.cols);
    return Dataframe.from(this.n, cols);
  };

  appendCol = <K extends Key, U extends VariableLike<any>>(key: K, col: U) => {
    // if (!col.isOfLength(this.n)) {
    //   throw new Error(`Column needs to be of same length as data: ${this.n}`);
    // }

    const cols = this.cols as Record<Key, VariableLike<any>>;
    cols[key] = col;
    this.keys.add(key);
    return Dataframe.from(this.n, cols);
  };

  appendCols = <U extends Cols>(data: Dataframe<U>) => {
    if (data.n != this.n) {
      throw new Error("Dataframes have different number of rows.");
    }

    const cols = this.cols as Record<Key, VariableLike<any>>;
    for (const [k, v] of allEntries(data.cols)) cols[k] = v;

    return new Dataframe(this.n, cols as T & U);
  };

  *[Symbol.iterator]() {
    const row = SlidingRow.from(this, 0);
    yield row.values();
    for (let i = 1; i < this.n; i++) yield row.slide().values();
  }
}
