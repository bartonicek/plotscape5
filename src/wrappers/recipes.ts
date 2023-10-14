import { PartitionSet } from "../structs/PartitionSet";
import { num } from "../structs/Scalar";

export const identity2D = (partitionSet: PartitionSet<any>) =>
  partitionSet.map(({ var1, var2 }) => ({ x: var1, y: var2 })).update();

export const catCount1D = (partitionSet: PartitionSet<any>) =>
  partitionSet
    .reduce(
      ({ count }, {}) => ({ count: count.inc() }),
      () => ({ count: num(0) })
    )
    .map(({ label, count }) => ({ x: label, y0: num(0), y1: count }))
    .stackAt(
      2,
      (parent, part) => ({ y0: parent.y1, y1: parent.y1.add(part.y1) }),
      () => ({ y0: num(0), y1: num(0) })
    )
    .update();

export const binCount1D = (partitionSet: PartitionSet<any>) =>
  partitionSet
    .reduce(
      ({ count }, _) => ({ count: count.inc() }),
      () => ({ count: num(0) })
    )
    .map(({ binMin, binMax, count }) => ({
      x0: binMin,
      x1: binMax,
      y0: num(0),
      y1: count,
    }))
    .stackAt(
      2,
      (parent, part) => ({ y0: parent.y1, y1: parent.y1.add(part.y1) }),
      () => ({ y0: num(0), y1: num(0) })
    )
    .update();