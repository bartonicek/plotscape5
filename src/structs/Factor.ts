import {
  alNumCompare,
  allEntries,
  diff,
  lazy,
  minMax,
  seq,
  toInt,
  toString,
} from "../utils/funs";
import { Cols, Lazy, Stringable } from "../utils/types";
import { Dataframe } from "./Dataframe";
import { ref } from "./Scalar";
import { positionsSymbol } from "./Symbols";
import {
  NumVariable,
  RefVariable,
  StrVariable,
  TranslatedVariable,
  VariableLike,
} from "./Variable";

export type FactorLike<T extends Cols> = {
  cardinality: () => number;
  uniqueIndices: () => Generator<number>;
  indices: () => Generator<number>;
  data: () => Dataframe<T>;
};

export class Factor {
  static mono = (n: number) => new Mono(n);
  static iso = (n: number) => new Iso(n);

  static from = <T extends Stringable>(array: T[], labels?: string[]) => {
    return factorFrom(array, labels);
  };

  static bin = (array: number[], width?: number, anchor?: number) => {
    return factorBin(array, width, anchor);
  };

  static product = <T extends Cols, U extends Cols>(
    factor1: FactorLike<T>,
    factor2: FactorLike<U>
  ) => {
    return factorProduct(factor1, factor2);
  };

  static computed = <T extends Cols>(
    uniqueIndices: Set<number>,
    indices: number[],
    data: Dataframe<T>
  ) => {
    return new Computed(uniqueIndices, indices, data);
  };
}

class Mono implements FactorLike<{ positions: VariableLike<object> }> {
  constructor(private n: number) {}

  cardinality = () => 1;

  *uniqueIndices() {
    yield 0;
  }

  *indices() {
    let i = 0;
    while (i < this.n) {
      yield 0;
      i++;
    }
  }

  data = () => {
    const push = lazy(1);
    const empty = () => {};
    const ith = (indexfn: Lazy<number>) => {
      if (indexfn() === 0) return ref(new Set(seq(0, this.n)));
    };

    const positions: VariableLike<object> = { ith, push, empty };
    return new Dataframe(1, { positions });
  };
}

class Iso implements FactorLike<{ positions: VariableLike<object> }> {
  constructor(private n: number) {}

  cardinality = () => this.n;

  *uniqueIndices() {
    let i = 0;
    while (i < this.n) yield i++;
  }

  *indices() {
    yield* this.uniqueIndices();
  }

  data = () => {
    const push = lazy(this.n);
    const empty = () => {};
    const ith = (indexfn: Lazy<number>) => {
      if (indexfn() < this.n) return ref(new Set([indexfn()]));
    };

    const positions: VariableLike<object> = { ith, push, empty };
    return new Dataframe(this.n, { positions });
  };
}

class Computed<T extends Cols> implements FactorLike<T> {
  constructor(
    private _uniqueIndices: Set<number>,
    private _indices: number[],
    public _data: Dataframe<T>
  ) {}

  cardinality = () => this._uniqueIndices.size;

  *uniqueIndices() {
    yield* this._uniqueIndices;
  }

  *indices() {
    yield* this._indices;
  }

  data = () => this._data;
}

const factorFrom = (array: Stringable[], labels?: string[]) => {
  if (!labels) {
    labels = Array.from(new Set(array)).map(toString).sort(alNumCompare);
  }

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
    label: StrVariable.from(labels),
    [positionsSymbol]: RefVariable.from(Object.values(positions)),
  });

  return new Computed(uniqueIndices, indices, data);
};

const factorBin = (array: number[], width?: number, anchor?: number) => {
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
    const kk = toInt(k);
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
    binMin: NumVariable.from(binMin),
    binMax: NumVariable.from(binMax),
    [positionsSymbol]: RefVariable.from(Object.values(positions)),
  };
  const data = new Dataframe(uniqueIndices.size, cols);

  return new Computed(uniqueIndices, indices, data);
};

const factorProduct = <T extends Cols, U extends Cols>(
  factor1: FactorLike<T>,
  factor2: FactorLike<U>
) => {
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
    const kk = toInt(k);
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

  for (const [k, v] of allEntries(data1.cols)) {
    cols[k] = new TranslatedVariable(v, translatefn1);
  }

  for (const [k, v] of allEntries(data2.cols)) {
    cols[k] = new TranslatedVariable(v, translatefn2);
  }

  cols[positionsSymbol as keyof typeof cols] = RefVariable.from(
    Object.values(positions)
  );

  const data = new Dataframe(uniqueIndices.size, cols as T & U);

  return new Computed(uniqueIndices, indices, data);
};
