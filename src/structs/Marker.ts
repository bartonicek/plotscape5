import {
  Accessor,
  Setter,
  createEffect,
  createSignal,
  untrack,
} from "solid-js";
import { seq } from "../utils/funs";
import { Dataframe } from "./Dataframe";
import {
  groupSymbol,
  layerSymbol,
  positionsSymbol,
  transientSymbol,
} from "./Symbols";
import { Factor } from "./factors/Factor";
import { FactorLike } from "./factors/FactorLike";
import { RefVariable } from "./variables/RefVariable";

export const TRANSIENT = 0;
export const [GROUP1, GROUP2, GROUP3, GROUP4] = [7, 6, 5, 4];

const addTransient = (index: number) => index & ~4;
const stripTransient = (index: number) => index | 4;

const transientGroups = [0, 1, 2, 3];

const group = RefVariable.from([4, 3, 2, 1, 4, 3, 2, 1]);
const layer = RefVariable.from([1, 2, 3, 4, 5, 6, 7, 8]);
const transient = RefVariable.from(Array.from(Array(8), (_, i) => i < 4));

const uniqueIndices = new Set(seq(0, 7));

export class Marker {
  data: Dataframe<any>;
  transientPositions: Set<number>;
  positionsArray: Set<number>[];

  indices: Accessor<number[]>;
  setIndices: Setter<number[]>;

  factor: Accessor<FactorLike<any>>;

  constructor(
    private n: number,
    private groupS: Accessor<number>,
    private selectedS: Accessor<Set<number>>
  ) {
    const positionsArray = Array.from(Array(8), () => new Set<number>());
    const positions = RefVariable.from(positionsArray);
    this.positionsArray = positionsArray;

    this.data = Dataframe.from(n, {
      [positionsSymbol]: positions,
      [groupSymbol]: group,
      [layerSymbol]: layer,
      [transientSymbol]: transient,
    });
    this.transientPositions = new Set<number>();

    const _indices = Array(n).fill(GROUP1);

    const [indices, setIndices] = createSignal(_indices);
    this.indices = indices;
    this.setIndices = setIndices;

    this.factor = () => Factor.computed(uniqueIndices, indices(), this.data);

    createEffect(() => {
      const { positionsArray, transientPositions } = this;
      const [selected, group] = [this.selectedS(), untrack(this.groupS)];
      const indices = [...untrack(this.indices)];

      if (!selected.size) return;

      for (const positions of positionsArray) {
        for (const i of selected) positions.delete(i);
      }

      if (group === TRANSIENT) {
        transientPositions.clear();

        for (const i of selected) {
          const index = addTransient(indices[i]);
          indices[i] = index;
          positionsArray[index].add(i);
          transientPositions.add(i);
        }
      } else {
        for (const i of selected) {
          indices[i] = group;
          positionsArray[group].add(i);
        }
      }

      this.setIndices(indices);
    });
  }

  clearAll() {
    const { n, positionsArray } = this;
    for (const positions of positionsArray) positions.clear();
    for (let i = 0; i < n; i++) positionsArray[GROUP1].add(i);
    this.setIndices(Array(n).fill(GROUP1));
  }

  clearTransient() {
    const { n, positionsArray, transientPositions } = this;
    const indices = [...untrack(this.indices)];

    for (const i of transientGroups) positionsArray[i].clear();
    for (let i = 0; i < n; i++) indices[i] = stripTransient(indices[i]);
    transientPositions.clear();

    this.setIndices(indices);
  }
}
