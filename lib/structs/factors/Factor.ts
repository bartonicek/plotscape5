import {
  allEntries,
  asInt,
  compareAlNum,
  diff,
  minMax,
  seq,
} from "../../utils/funs";
import { Cols, Lazy } from "../../utils/types";
import { Dataframe } from "../Dataframe";
import { positionsSymbol } from "../Symbols";
import { NumVariable } from "../variables/NumVariable";
import { RefVariable } from "../variables/RefVariable";
import { StrVariable } from "../variables/StrVariable";
import { TranslatedVariable } from "../variables/TranslatedVariable";
import { VariableLike } from "../variables/VariableLike";
import { Computed } from "./Computed";
import { FactorLike } from "./FactorLike";
import { Iso } from "./Iso";
import { Mono } from "./Mono";

export class Factor {
  static mono(n: number) {
    return new Mono(n);
  }

  static iso(n: number) {
    return new Iso(n);
  }

  static computed<T extends Cols>(
    uniqueIndices: Set<number>,
    indices: number[],
    data: Dataframe<T>
  ) {
    return new Computed(uniqueIndices, indices, data);
  }

  static from<T extends StrVariable>(strVariable: T, labels?: string[]) {
    const { array, meta } = strVariable;

    if (!labels) labels = meta.values.sort(compareAlNum);

    const uniqueIndices = new Set(seq(0, labels.length));
    const indices = [] as number[];
    const positions = {} as Record<number, Set<number>>;

    for (let i = 0; i < array.length; i++) {
      const index = labels.indexOf(array[i].toString());
      if (!positions[index]) positions[index] = new Set();
      positions[index].add(i);
      indices.push(index);
    }

    const data = new Dataframe(labels.length, {
      label: StrVariable.from(labels, { name: strVariable.name }),
      [positionsSymbol]: RefVariable.from(Object.values(positions)),
    });

    return new Computed(uniqueIndices, indices, data);
  }

  static bin(variable: NumVariable, width?: number, anchor?: number) {
    const array = variable.values();
    const [min, max] = minMax(array);

    const nBins = width ? Math.ceil((max - min) / width) + 1 : 10;
    width = width ?? (max - min) / (nBins - 1);
    anchor = anchor ?? min;

    const breakMin = min - width + ((anchor - min) % width);
    const breakMax = max + width - ((max - anchor) % width);

    const breaks = Array(nBins + 2);
    breaks[0] = breakMin;
    breaks[breaks.length - 1] = breakMax;

    for (let i = 1; i < breaks.length - 1; i++) {
      breaks[i] = breakMin + i * width;
    }

    const dirtyUniqueIndices = new Set<number>();
    const dirtyIndices = [] as number[];
    const positions = {} as Record<number, Set<number>>;

    for (let i = 0; i < array.length; i++) {
      const index = breaks.findIndex((br) => br >= array[i]) - 1;
      if (!positions[index]) positions[index] = new Set();

      positions[index].add(i);
      dirtyUniqueIndices.add(index);
      dirtyIndices.push(index);
    }

    // Need to clean indices/get rid off unused bins

    const sortedDirtyIndices = Array.from(dirtyUniqueIndices).sort(diff);
    const uniqueIndices = new Set<number>();
    const indexMap = {} as Record<number, number>;

    for (const [k, v] of Object.entries(sortedDirtyIndices)) {
      const kk = asInt(k);
      uniqueIndices.add(kk);
      indexMap[v] = kk;
    }

    const indices = dirtyIndices;
    for (let i = 0; i < indices.length; i++) indices[i] = indexMap[indices[i]];

    const binMin = [] as number[];
    const binMax = [] as number[];

    for (const i of sortedDirtyIndices) {
      binMin.push(breaks[i]);
      binMax.push(breaks[i + 1]);
    }

    const cols = {
      bin0: NumVariable.from(binMin, { name: variable.name }),
      bin1: NumVariable.from(binMax, { name: variable.name }),
      [positionsSymbol]: RefVariable.from(Object.values(positions)),
    };
    const data = new Dataframe(uniqueIndices.size, cols);

    return new Computed(uniqueIndices, indices, data);
  }

  static product<T extends Cols, U extends Cols>(
    factor1: FactorLike<T>,
    factor2: FactorLike<U>
  ) {
    const cardinality2 = factor2.cardinality();

    const dirtyUniqueIndices = new Set<number>();
    const dirtyIndices = [] as number[];
    const positions = {} as Record<number, Set<number>>;

    const dirtyIndexMap1 = {} as Record<number, number>;
    const dirtyIndexMap2 = {} as Record<number, number>;

    const generator1 = factor1.indices();
    const generator2 = factor2.indices();
    let next1 = generator1.next();
    let next2 = generator2.next();
    let i = 0;

    while (!next1.done) {
      const index = next1.value * cardinality2 + next2.value;

      if (!positions[index]) positions[index] = new Set();

      positions[index].add(i);
      dirtyUniqueIndices.add(index);
      dirtyIndices.push(index);

      dirtyIndexMap1[index] = next1.value;
      dirtyIndexMap2[index] = next2.value;

      next1 = generator1.next();
      next2 = generator2.next();
      i++;
    }

    // Need to clean indices/get rid off unused combinations of levels

    const sortedDirtyIndices = Array.from(dirtyUniqueIndices).sort(diff);
    const uniqueIndices = new Set<number>();
    const indexMapCombined = {} as Record<number, number>;
    const indexMap1 = {} as Record<number, number>;
    const indexMap2 = {} as Record<number, number>;

    for (const [k, v] of Object.entries(sortedDirtyIndices)) {
      const kk = asInt(k);
      uniqueIndices.add(kk);
      indexMapCombined[v] = kk;

      indexMap1[kk] = dirtyIndexMap1[v];
      indexMap2[kk] = dirtyIndexMap2[v];
    }

    const indices = dirtyIndices;
    for (let i = 0; i < indices.length; i++) {
      indices[i] = indexMapCombined[indices[i]];
    }

    const data1 = factor1.data();
    const data2 = factor2.data();

    const cols = {} as {
      [key in keyof T | keyof U | typeof positionsSymbol]: VariableLike<any>;
    };

    const translatefn1 = (indexfn: Lazy<number>) => () => indexMap1[indexfn()];
    const translatefn2 = (indexfn: Lazy<number>) => () => indexMap2[indexfn()];

    const seenKeys = new Set<string>();

    for (const [k, v] of allEntries(data1.cols)) {
      if (typeof k === "string") seenKeys.add(k);
      cols[k] = new TranslatedVariable(v, translatefn1);
    }

    for (let [k, v] of allEntries(data2.cols)) {
      if (typeof k === "string") while (seenKeys.has(k)) k += "$";
      cols[k] = new TranslatedVariable(v, translatefn2);
    }

    cols[positionsSymbol as keyof typeof cols] = RefVariable.from(
      Object.values(positions)
    );

    const data = new Dataframe(uniqueIndices.size, cols as T & U);

    return new Computed(uniqueIndices, indices, data);
  }
}
