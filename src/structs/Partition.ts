import { Accessor, createMemo, untrack } from "solid-js";
import { allEntries, allKeys, lazy } from "../utils/funs";
import { Cols, Key, Row, RowOf } from "../utils/types";
import { Dataframe } from "./Dataframe";
import { Factor, FactorLike } from "./Factor";
import { Recipe } from "./Recipe";
import { None, ScalarLike, isScalar, none } from "./Scalar";
import { SlidingRow } from "./SlidingRow";
import { parentSymbol, stackSymbol, symbols } from "./Symbols";
import { ConstantVariable, RefVariable, VariableLike } from "./Variable";

export class Partition<T extends Cols> {
  reduced: Accessor<Dataframe<Cols>>;
  mappedStacked: Accessor<Dataframe<Cols>>;

  constructor(
    public factor: Accessor<FactorLike<any>>,
    public data: Dataframe<T>,
    public recipe: Recipe<RowOf<T>, any, any>,
    public parent?: Partition<T>
  ) {
    this.reduced = createMemo(() => this.reduce());
    this.mappedStacked = createMemo(() => this.mapAndStack());
  }

  update = () => {
    this.reduced = createMemo(() => this.reduce());
    this.mappedStacked = createMemo(() => this.mapAndStack());
  };

  nest = (
    childFactor: Accessor<FactorLike<any>>,
    recipe?: Recipe<any, any, any>
  ) => {
    const { data, factor } = this;
    recipe = recipe ?? this.recipe;

    const product = () => Factor.product(factor(), childFactor());
    const childPartition = new Partition(product, data, recipe, this);
    return childPartition;
  };

  reduce = (): Dataframe<Cols> => {
    const { data, parent, recipe } = this;

    // If we do not reduce, just combine data and factor data
    if (!recipe.state.reduced) {
      const cols = {} as Record<Key, VariableLike<any>>;

      const factorCols = this.factor().data().cols;
      for (const k of allKeys(factorCols)) cols[k] = factorCols[k];
      for (const k of allKeys(data.cols)) cols[k] = data.cols[k];

      return Dataframe.from(data.n, cols);
    }

    const factor = this.factor();
    const indices = factor.indices();
    const parentFactor = parent ? untrack(parent.factor) : undefined;
    const parentIndices = parentFactor?.indices();

    const reducedRows: Record<number, Record<Key, ScalarLike<any>>> = {};
    const parentRefs = {} as Record<number, number>;

    const slider = SlidingRow.from(data, 0);
    let parentNext = parentIndices?.next();

    for (const index of indices) {
      if (!reducedRows[index]) {
        reducedRows[index] = recipe.reduceinit();
        parentRefs[index] = parentNext?.value;
      }

      reducedRows[index] = recipe.reducefn(reducedRows[index], slider.values());
      parentNext = parentIndices?.next();
      slider.slide();
    }

    const parentVariable = RefVariable.from(Object.values(parentRefs));
    const result = Dataframe.fromRows(Object.values(reducedRows));
    const factorData = factor.data();

    // Copy over parent ref. variable & factor variables
    if (parent) result.appendCol(parentSymbol, parentVariable);
    for (const [k, v] of allEntries(factorData.cols)) result.appendCol(k, v);

    return result as unknown as Dataframe<Cols>;
  };

  mapAndStack = () => {
    const { recipe, parent } = this;
    const reduced = this.reduced();
    const factor = untrack(this.factor);

    if (!parent) {
      const mappedRow = recipe.mapfn(reduced.row(lazy(0)));
      const result = Dataframe.fromRows([mappedRow]);
      for (const s of symbols) {
        if (s in reduced.cols) result.appendCol(s, reduced.cols[s]);
      }
      return result as unknown as Dataframe<Cols>;
    }

    const parentData = parent ? untrack(parent.mapAndStack) : undefined;
    const parentRows = parentData?.rows() as Row[] | undefined;

    const slider = SlidingRow.from(reduced, 0);

    // Try if every property of the mapped row can be created
    // by only renaming/instantiating. If so, no need to loop.
    if (!recipe.state.stacked) {
      const rowNoop = {} as Record<Key, None>;
      for (const k of allKeys(slider.values())) rowNoop[k] = none();
      let noop = true;

      try {
        recipe.mapfn(rowNoop);
      } catch {
        noop = false;
      }

      if (noop) {
        const cols = recipe.mapfn(reduced.cols);
        for (const k of allKeys(cols)) {
          if (isScalar(cols[k])) cols[k] = ConstantVariable.of(cols[k]);
        }

        const result = Dataframe.from(reduced.n, cols);
        for (const s of symbols) {
          if (s in reduced.cols) result.appendCol(s, reduced.cols[s]);
        }

        return result;
      }
    }
    //

    const row1 = recipe.mapfn(slider.values());

    const cols = {} as Record<Key, VariableLike<any>>;
    for (const k of allKeys(row1)) cols[k] = row1[k].toVariable();

    const result = Dataframe.from(1, cols).empty();

    for (const _ of factor.uniqueIndices()) {
      const row = slider.values();

      if (!parentRows) {
        result.push(recipe.mapfn(row));
        slider.slide();
        continue;
      }

      const parentIndex = row[parentSymbol].value() as number;
      const parentRow = parentRows[parentIndex];
      row["parent"] = parentRow as any;

      const mappedRow = recipe.mapfn(row);

      if (!recipe.state.stacked) {
        result.push(mappedRow);
        slider.slide();
        continue;
      }

      if (!parentRow[stackSymbol]) {
        parentRow[stackSymbol] = recipe.stackinit();
      }

      const stackedRow = recipe.stackfn(parentRow[stackSymbol], mappedRow);
      parentRows[parentIndex][stackSymbol] = stackedRow;

      result.push(Object.assign(mappedRow, stackedRow));
      slider.slide();
    }

    for (const s of symbols) {
      if (s in reduced.cols) result.appendCol(s, reduced.cols[s]);
    }

    return result;
  };
}
