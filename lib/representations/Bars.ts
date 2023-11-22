import { Accessor, Setter, createSignal } from "solid-js";
import graphicParameters from "../dom/graphicParameters";
import { Context, groupContexts } from "../dom/plot/Contexts";
import { Adapter } from "../structs/Adapter";
import {
  groupSymbol,
  layerSymbol,
  positionsSymbol,
  transientSymbol,
} from "../structs/Symbols";
import { drawClear, drawRect } from "../utils/drawfuns";
import { pointInRect, rectOverlap } from "../utils/funs";
import { Representation } from "./Representation";
import { transientOptions } from "./transientOpts";

export default class Bars implements Representation {
  widthPct: Accessor<number>;
  setWidthPct: Setter<number>;
  keyActions: Record<string, any>;

  constructor(private adapter: Adapter) {
    const [widthPct, setWidthPct] = createSignal(graphicParameters.width);
    this.widthPct = widthPct;
    this.setWidthPct = setWidthPct;
    this.keyActions = {
      Equal: () => this.setWidthPct((w) => Math.min(1, (w * 10) / 9)),
      Minus: () => this.setWidthPct((w) => (w * 9) / 10),
      KeyR: () => this.setWidthPct(graphicParameters.width),
    };
  }

  draw = () => {
    const { contexts, partData, scaleX, scaleY, breakWidthX } = this.adapter;
    const widthPct = this.widthPct();

    const data = partData(2);
    const width = breakWidthX() * widthPct;

    // Clear previous paints
    for (const layer of groupContexts) drawClear(contexts[layer]);

    for (const row of data) {
      const x0 = scaleX(row.x.value()) - width / 2;
      const x1 = scaleX(row.x.value()) + width / 2;
      const y0 = scaleY(row.y0.value());
      const y1 = scaleY(row.y1.value());

      const group = row[groupSymbol].value();
      const layer = row[layerSymbol].value();
      const transient = row[transientSymbol].value();

      const context = contexts[layer as Context];
      const color = graphicParameters.groupColours[group - 1];

      drawRect(context, x0, y0, x1, y1, { alpha: 1, color });
      if (transient) drawRect(context, x0, y0, x1, y1, transientOptions);
    }
  };

  checkSelection = (coords: [number, number, number, number]) => {
    const { partData, scaleX, scaleY, breakWidthX } = this.adapter;
    const widthPct = this.widthPct();

    const data = partData(1);
    const width = breakWidthX() * widthPct;

    const selX = [coords[0], coords[2]] as [number, number];
    const selY = [coords[1], coords[3]] as [number, number];
    const selected = new Set<number>();

    for (const row of data) {
      const x0 = scaleX(row.x.value()) - width / 2;
      const x1 = scaleX(row.x.value()) + width / 2;
      const y0 = scaleY(row.y0.value());
      const y1 = scaleY(row.y1.value());

      if (rectOverlap([x0, x1], [y0, y1], selX, selY)) {
        for (const cs of row[positionsSymbol].value()) selected.add(cs);
      }
    }

    return selected;
  };

  queryAt = (x: number, y: number) => {
    const { partData, scaleX, scaleY, breakWidthX } = this.adapter;
    const widthPct = this.widthPct();

    const data = partData(1);
    const width = breakWidthX() * widthPct;

    for (const row of data) {
      const x0 = scaleX(row.x.value()) - width / 2;
      const x1 = scaleX(row.x.value()) + width / 2;
      const y0 = scaleY(row.y0.value());
      const y1 = scaleY(row.y1.value());

      if (pointInRect([x, y], [x0, y0, x1, y1])) return row;
    }
  };
}
