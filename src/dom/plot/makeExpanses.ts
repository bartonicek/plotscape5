import { num } from "../../structs/scalars/utils";
import { ExpanseLinear } from "../../structs/scales/ExpanseLinear";
import { sig } from "../../structs/values/utils";
import { PlotStore } from "./makePlotStore";

export const makeExpanses = (store: PlotStore) => {
  return {
    inner: {
      horizontal: ExpanseLinear.default().setLimits(
        num(0),
        sig(store.innerWidth)
      ),
      vertical: ExpanseLinear.default().setLimits(
        num(0),
        sig(store.innerHeight)
      ),
    },
    outer: {
      horizontal: ExpanseLinear.default().setLimits(
        sig(store.innerLeft),
        sig(store.innerRight)
      ),
      vertical: ExpanseLinear.default().setLimits(
        sig(store.innerBottom),
        sig(store.innerTop)
      ),
    },
    norm: {
      x: ExpanseLinear.default().setLimits(
        sig(store.normXLower),
        sig(store.normXUppper)
      ),
      y: ExpanseLinear.default().setLimits(
        sig(store.normYLower),
        sig(store.normYUpper)
      ),
    },
    outerH: ExpanseLinear.default().setLimits(
      sig(store.innerLeft),
      sig(store.innerRight)
    ),
    outerV: ExpanseLinear.default().setLimits(
      sig(store.innerBottom),
      sig(store.innerTop)
    ),
    innerH: ExpanseLinear.default().setLimits(num(0), sig(store.innerWidth)),
    innerV: ExpanseLinear.default().setLimits(num(0), sig(store.innerHeight)),
    normX: ExpanseLinear.default().setLimits(
      sig(store.normXLower),
      sig(store.normXUppper)
    ),
    normY: ExpanseLinear.default().setLimits(
      sig(store.normYLower),
      sig(store.normYUpper)
    ),
  };
};

export type PlotExpanses = ReturnType<typeof makeExpanses>;
