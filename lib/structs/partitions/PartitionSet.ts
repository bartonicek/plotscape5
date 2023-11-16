import { Accessor } from "solid-js";
import { Cols, Lazy, MapFn, ReduceFn, Row, RowOf } from "../../utils/types";
import { Dataframe } from "../Dataframe";
import { Recipe } from "../Recipe";
import { FactorLike } from "../factors/FactorLike";
import { Partition } from "./Partition";

export class PartitionSet<T extends Cols> {
  partitions: Partition<any>[];
  recipes: Recipe<RowOf<T>, Row, Row>[];

  constructor(
    public factors: Accessor<FactorLike<any>>[],
    public data: Dataframe<T>
  ) {
    this.partitions = [];
    this.recipes = [];

    for (const _ of factors) this.recipes.push(Recipe.default());
  }

  reduceAt = <U extends Row>(
    index: number,
    reducefn: ReduceFn<RowOf<T>, U>,
    init: Lazy<U>
  ) => {
    this.recipes[index].reduce(reducefn, init);
    return this;
  };

  apply(fn: any) {
    fn(this);
    return this;
  }

  reduce<U extends Row>(reducefn: ReduceFn<RowOf<T>, U>, init: Lazy<U>) {
    for (const recipe of this.recipes) recipe.reduce(reducefn, init);
    return this;
  }

  mapAt<U extends Row, V extends Row>(index: number, mapfn: MapFn<U, V>) {
    this.recipes[index].map(mapfn as any);
    return this;
  }

  map<U extends Row, V extends Row>(mapfn: MapFn<U, V>) {
    for (const recipe of this.recipes) recipe.map(mapfn as any);
    return this;
  }

  stackAt<U extends Row>(
    index: number,
    stackfn: ReduceFn<U, U>,
    init: Lazy<U>
  ) {
    this.recipes[index].stack(stackfn, init);
    return this;
  }

  stack<U extends Row>(stackfn: ReduceFn<U, U>, init: Lazy<U>) {
    for (const recipe of this.recipes) recipe.stack(stackfn, init);
    return this;
  }

  partData = (index: number) => this.partitions[index].mappedAndStacked();
  update = () => {
    const { factors, data, recipes } = this;

    if (!this.partitions.length) {
      let partition = new Partition(factors[0], data, recipes[0]);
      this.partitions.push(partition);

      for (let i = 1; i < this.factors.length; i++) {
        partition = partition.nest(factors[i], recipes[i]);
        this.partitions.push(partition);
      }
    }

    for (const partition of this.partitions) {
      partition.update();
    }

    return this;
  };
}
