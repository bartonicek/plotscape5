import { num } from "../../structs/scalars/utils";
import { Expanse } from "../../structs/scales/Expanse";
import { sig } from "../../structs/values/utils";
import { PlotStore } from "./makePlotStore";

export const makeExpanses = (store: PlotStore) => {
  return {
    outerH: Expanse.default().setSignals(
      sig(store.innerLeft),
      sig(store.innerRight)
    ),
    outerV: Expanse.default().setSignals(
      sig(store.innerBottom),
      sig(store.innerTop)
    ),
    innerH: Expanse.default().setSignals(num(0), sig(store.innerWidth)),
    innerV: Expanse.default().setSignals(num(0), sig(store.innerHeight)),
    normX: Expanse.default().setSignals(
      sig(store.normXLower),
      sig(store.normXUppper)
    ),
    normY: Expanse.default().setSignals(
      sig(store.normYLower),
      sig(store.normYUpper)
    ),
  };
};

export type PlotExpanses = ReturnType<typeof makeExpanses>;
