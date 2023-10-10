import {
  Accessor,
  Setter,
  createEffect,
  createSignal,
  untrack,
} from "solid-js";
import { Factor, FactorLike } from "../structs/Factor";
import { seq } from "../utils/funs";
import { Dataframe } from "./Dataframe";
import {
  groupSymbol,
  layerSymbol,
  positionsSymbol,
  transientSymbol,
} from "./Symbols";
import { RefVariable } from "./Variable";

export const Group = {
  Group1T: 4,
  Group2T: 3,
  Group3T: 2,
  Group4T: 1,
  Group1: 132,
  Group2: 131,
  Group3: 130,
  Group4: 129,
} as const;

export const groups = [4, 3, 2, 1, 132, 131, 130, 129] as const;
export const transientGroups = [4, 3, 2, 1] as const;

const groupIndexMap = {} as Record<number, number>;
for (let i = 0; i < groups.length; i++) groupIndexMap[groups[i]] = i;

const uniqueIndices = new Set(seq(0, 7));

const addTransient = (x: number) => x & ~128;
const removeTransient = (x: number) => x | 128;

const groupVar = RefVariable.from([1, 2, 3, 4, 1, 2, 3, 4]);
const layerVar = RefVariable.from([4, 3, 2, 1, 4, 3, 2, 1]);
const transientVar = RefVariable.from([
  ...Array(4).fill(true),
  ...Array(4).fill(false),
]);

export default class Marker {
  indices: Accessor<number[]>;
  setIndices: Setter<number[]>;
  factor: Accessor<FactorLike<any>>;

  transientPositions: Set<number>;
  positionsArray: Set<number>[];

  data: Dataframe<Record<symbol, RefVariable>>;

  constructor(
    public n: number,
    public cases: Accessor<Set<number>>,
    public group: Accessor<number>
  ) {
    const [indices, setIndices] = createSignal(
      Array(n).fill(groupIndexMap[Group.Group1])
    );
    this.indices = indices;
    this.setIndices = setIndices;

    this.transientPositions = new Set();
    this.positionsArray = Array.from(Array(8), () => new Set<number>());
    this.positionsArray[groupIndexMap[Group.Group1]] = new Set(seq(0, n - 1));

    const positionsVar = RefVariable.from(this.positionsArray);

    this.data = Dataframe.from(8, {
      [positionsSymbol]: positionsVar,
      [groupSymbol]: groupVar,
      [layerSymbol]: layerVar,
      [transientSymbol]: transientVar,
    });

    this.cases = cases;
    this.group = group;
    this.factor = () => {
      return Factor.computed(uniqueIndices, indices(), this.data);
    };

    createEffect(() => {
      const { positionsArray, transientPositions } = this;
      const [cases, group] = [this.cases(), untrack(this.group)];
      const indices = [...untrack(this.indices)];

      if (!cases.size) return;

      for (const group of groups) {
        for (const i of cases) positionsArray[groupIndexMap[group]].delete(i);
      }

      if (group === 128) {
        transientPositions.clear();

        for (const i of cases) {
          const group = addTransient(indices[i]);
          indices[i] = groupIndexMap[group];
          positionsArray[groupIndexMap[group]].add(i);
          transientPositions.add(i);
        }
      } else {
        for (const i of cases) {
          indices[i] = groupIndexMap[group];
          positionsArray[groupIndexMap[group]].add(i);
        }
      }

      this.setIndices(indices);
    });
  }

  clearAll = () => {
    const { n, positionsArray } = this;
    for (const group of groups) positionsArray[groupIndexMap[group]].clear();
    for (let i = 0; i < n; i++) {
      positionsArray[groupIndexMap[Group.Group1]].add(i);
    }
    this.setIndices(Array(n).fill(groupIndexMap[Group.Group1]));
  };

  clearTransient = () => {
    const { positionsArray, transientPositions } = this;
    const indexArray = [...untrack(this.indices)];

    for (const group of transientGroups) {
      positionsArray[groupIndexMap[group]].clear();
    }

    for (const i of transientPositions) {
      indexArray[i] = groupIndexMap[removeTransient(indexArray[i])];
      positionsArray[groupIndexMap[Group.Group1]].add(i);
    }

    this.setIndices(indexArray);
  };
}
