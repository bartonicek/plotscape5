import { Accessor, Setter, createMemo, createSignal, untrack } from "solid-js";
import { allEntries, allKeys, lazy } from "../../utils/funs";
import { Cols, Key, Row, RowOf } from "../../utils/types";
import { Dataframe } from "../Dataframe";
import { Recipe } from "../Recipe";
import { SlidingRow } from "../SlidingRow";
import { parentSymbol, stackSymbol, symbols } from "../Symbols";
import { Factor } from "../factors/Factor";
import { FactorLike } from "../factors/FactorLike";
import { None } from "../scalars/None";
import { ScalarLike } from "../scalars/ScalarLike";
import { isScalar, none } from "../scalars/utils";
import { ConstantVariable } from "../variables/ConstantVariable";
import { RefVariable } from "../variables/RefVariable";
import { VariableLike } from "../variables/VariableLike";

export class Partition<T extends Cols> {
  trigger: Accessor<undefined>;
  setTrigger: Setter<undefined>;
  reduced: Accessor<Dataframe<Cols>>;
  mappedAndStacked: Accessor<Dataframe<Cols>>;

  constructor(
    public factor: Accessor<FactorLike<any>>,
    public data: Dataframe<T>,
    public recipe: Recipe<RowOf<T>, any, any>,
    public parent?: Partition<T>
  ) {
    // Signal to trigger manual recomputation
    const [trigger, setTrigger] = createSignal(undefined, { equals: false });
    this.trigger = trigger;
    this.setTrigger = setTrigger;

    this.reduced = createMemo(() => this.reduce());
    this.mappedAndStacked = createMemo(() => this.mapAndStack());
  }

  update = () => this.setTrigger(undefined);

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
    this.trigger();

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
          if (isScalar(cols[k])) cols[k] = ConstantVariable.from(cols[k]);
        }

        const result = Dataframe.from(reduced.n, cols);
        for (const s of symbols) {
          if (s in reduced.cols) result.appendCol(s, reduced.cols[s]);
        }

        return result;
      }
    }
    //

    const row1 = slider.values();
    row1.parent = parentRows![row1[parentSymbol].value()] as any;
    const mappedRow1 = recipe.mapfn(row1);

    const cols = {} as Record<Key, VariableLike<any>>;
    for (const k of allKeys(mappedRow1)) cols[k] = mappedRow1[k].toVariable();

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
      row.parent = parentRow as any;

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
