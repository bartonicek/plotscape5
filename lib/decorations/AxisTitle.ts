import graphicParameters from "../dom/graphicParameters";
import { Plot } from "../dom/plot/Plot";
import { makeCanvasContext } from "../dom/plot/makeCanvasContext";
import { PlotStore } from "../dom/plot/makePlotStore";
import { drawClear, drawText } from "../utils/drawfuns";
import { Dict } from "../utils/types";
import { Decoration } from "./Decoration";

type AlignmentOptions = {
  textBaseline: CanvasTextBaseline;
  textAlign: CanvasTextAlign;
};

const axisAlign: { x: AlignmentOptions; y: AlignmentOptions } = {
  x: {
    textBaseline: "top",
    textAlign: "center",
  },
  y: {
    textBaseline: "bottom",
    textAlign: "left",
  },
} as const;

export class AxisTitle implements Decoration {
  context: CanvasRenderingContext2D;
  scales: Dict;
  store: PlotStore;

  constructor(private plot: Plot, private along: "x" | "y") {
    this.context = makeCanvasContext(plot, {
      inner: false,
      classes: ["over"],
    });
    this.scales = plot.scales.outer;
    this.store = plot.store;
  }

  title() {
    return this.plot[`${this.along}Title`];
  }

  draw = () => {
    const { context, scales, along, store } = this;
    const title = this.title();

    if (!title) return;

    const scale = scales.pct[along];

    const { height, marginLeft, marginBottom } = store;
    const { titleFontsize: fontsize } = graphicParameters;

    const yBase = height() - marginBottom() / 2;
    const xBase = marginLeft() / 2;
    const primary = scale.pushforward(0.5);

    drawClear(context);

    context.textBaseline = axisAlign[along].textBaseline;
    context.textAlign = axisAlign[along].textAlign;

    const opts = { fontsize, fontfamily: `Times` };

    if (along === "x") drawText(context, title, primary, yBase, opts);
    else drawText(context, title, xBase, primary, { ...opts, vertical: true });
  };
}
