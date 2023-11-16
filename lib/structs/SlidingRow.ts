import { Cols, RowOf } from "../utils/types";
import { Dataframe } from "./Dataframe";

export class SlidingRow<T extends Cols> {
  row: RowOf<T>;
  indexfn: () => number;

  constructor(data: Dataframe<T>, private index: number) {
    this.indexfn = () => this.index;
    this.row = data.row(this.indexfn);
  }

  static from<T extends Cols>(data: Dataframe<T>, index: number) {
    return new SlidingRow(data, index);
  }

  values() {
    return this.row;
  }

  slide() {
    this.index++;
    return this;
  }
}
