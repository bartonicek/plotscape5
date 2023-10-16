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
    };
  };
  outer: {
    data: {
      x: ScaleLike;
      y: ScaleLike;
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
        x: ScaleLinear.default()
          .setDomain(innerH.lower, innerH.upper)
          .setNorm(normX.lower, normX.upper),
        y: ScaleLinear.default()
          .setDomain(innerV.lower, innerV.upper)
          .setNorm(normY.lower, normY.upper),
      },
      data: {
        x: ScalePlaceholder.default()
          .setCodomain(innerH.lower, innerH.upper)
          .setNorm(normX.lower, normX.upper),
        y: ScalePlaceholder.default()
          .setCodomain(innerV.lower, innerV.upper)
          .setNorm(normY.lower, normY.upper),
      },
    },
    outer: {
      pct: {
        x: ScaleLinear.default()
          .setDomain(outerH.lower, outerH.upper)
          .setNorm(normX.lower, normX.upper),
        y: ScaleLinear.default()
          .setDomain(outerH.lower, outerH.upper)
          .setNorm(normY.lower, normY.upper),
      },
      data: {
        x: ScalePlaceholder.default()
          .setCodomain(outerH.lower, outerH.upper)
          .setNorm(normX.lower, normX.upper),
        y: ScalePlaceholder.default()
          .setCodomain(outerV.lower, outerV.upper)
          .setNorm(normY.lower, normY.upper),
      },
    },
  };
};
