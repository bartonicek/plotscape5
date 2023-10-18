import { PartitionSet } from "../structs/partitions/PartitionSet";
import { num } from "../structs/scalars/utils";
import { POJO, secondArgument } from "../utils/funs";

export function identity2D(partitionSet: PartitionSet<any>) {
  return partitionSet.map(({ var1, var2 }) => ({ x: var1, y: var2 })).update();
}

export function catCount1D(partitionSet: PartitionSet<any>) {
  return partitionSet
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
}

export function binCount1D(partitionSet: PartitionSet<any>) {
  return partitionSet
    .reduce(
      ({ summary1 }, _) => ({ summary1: summary1.inc() }),
      () => ({ summary1: num(0) })
    )
    .map(({ binMin, binMax, summary1 }) => {
      return { x0: binMin, x1: binMax, y0: num(0), y1: summary1 };
    })
    .stackAt(1, secondArgument, POJO)
    .stackAt(
      2,
      (parent, part) => ({ y0: parent.y1, y1: parent.y1.add(part.y1) }),
      () => ({ y0: num(0), y1: num(0) })
    )
    .update();
}

export function binCount1DScaled(partitionSet: PartitionSet<any>) {
  return partitionSet
    .reduce(
      ({ summary1 }, _) => ({ summary1: summary1.inc() }),
      () => ({ summary1: num(0) })
    )
    .mapAt(0, ({ summary1 }) => ({ x1: summary1 }))
    .mapAt(1, ({ summary1 }) => ({
      x0: num(0),
      x1: summary1,
      y0: num(0),
      y1: num(1),
      summary1,
    }))
    .mapAt(2, ({ summary1, parent }) => {
      return {
        x0: parent.x0,
        x1: parent.x1,
        y0: num(0),
        y1: summary1.divideBy(parent.summary1),
      };
    })
    .stackAt(
      1,
      (parent, part) => ({ x0: parent.x1, x1: parent.x1.add(part.x1) }),
      () => ({ x1: num(0) })
    )
    .stackAt(
      2,
      (parent, part) => ({ y0: parent.y1, y1: parent.y1.add(part.y1) }),
      () => ({ y0: num(0), y1: num(0) })
    )
    .update();
}
