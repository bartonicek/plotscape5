import { Cols } from "../../utils/types";
import { Dataframe } from "../Dataframe";

export type FactorLike<T extends Cols> = {
  cardinality(): number;
  uniqueIndices(): Generator<number>;
  indices(): Generator<number>;
  data(): Dataframe<T>;
};
