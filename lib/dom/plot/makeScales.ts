import { ScaleLike } from "../../structs/scales/ScaleLike";
import { ScaleLinear } from "../../structs/scales/ScaleLinear";
import { ScalePlaceholder } from "../../structs/scales/ScalePlaceholder";
import { PlotExpanses } from "./makeExpanses";

export type PlotScales = {
  inner: {
    pct: {
      x: ScaleLike;
      y: ScaleLike;
    };
    data: {
      x: ScaleLike;
      y: ScaleLike;
      size: ScaleLike;
    };
  };
  outer: {
    data: {
      x: ScaleLike;
      y: ScaleLike;
      size: ScaleLike;
    };
    pct: {
      x: ScaleLike;
      y: ScaleLike;
    };
  };
};

export const makeScales = (expanses: PlotExpanses): PlotScales => {
  const { outerH, outerV, innerH, innerV, normX, normY } = expanses;

  return {
    inner: {
      pct: {
        x: ScaleLinear.default().setCodomain(innerH),
        y: ScaleLinear.default().setCodomain(innerV),
      },
      data: {
        x: ScalePlaceholder.default().setCodomain(innerH).setNorm(normX),
        y: ScalePlaceholder.default().setCodomain(innerV).setNorm(normY),
        size: ScalePlaceholder.default(),
      },
    },
    outer: {
      pct: {
        x: ScaleLinear.default().setCodomain(outerH),
        y: ScaleLinear.default().setCodomain(outerV),
      },
      data: {
        x: ScalePlaceholder.default().setCodomain(outerH).setNorm(normX),
        y: ScalePlaceholder.default().setCodomain(outerV).setNorm(normY),
        size: ScalePlaceholder.default(),
      },
    },
  };
};
