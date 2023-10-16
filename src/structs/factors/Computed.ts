import { Cols } from "../../utils/types";
import { Dataframe } from "../Dataframe";
import { FactorLike } from "./FactorLike";

export class Computed<T extends Cols> implements FactorLike<T> {
  constructor(
    public _uniqueIndices: Set<number>,
    public _indices: number[],
    public _data: Dataframe<T>
  ) {}

  cardinality() {
    return this._uniqueIndices.size;
  }

  *uniqueIndices() {
    yield* this._uniqueIndices;
  }

  *indices() {
    yield* this._indices;
  }

  data() {
    return this._data;
  }
}
