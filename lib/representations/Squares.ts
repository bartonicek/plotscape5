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
import { rectOverlap } from "../utils/funs";
import { Representation } from "./Representation";
import { transientOptions } from "./transientOpts";

export class Squares implements Representation {
  constructor(private adapter: Adapter) {}
  draw() {
    const {
      contexts,
      partData,
      scaleX,
      scaleY,
      scaleSize,
      breakWidthX,
      breakWidthY,
    } = this.adapter;

    const data = partData(2);
    const sizeX = Math.min(breakWidthX(), breakWidthY()) / 2;

    for (const layer of groupContexts) drawClear(contexts[layer]);

    for (const row of data) {
      const x = scaleX(row.x.value());
      const y = scaleY(row.y.value());
      const size = scaleSize(row.size.value()) * sizeX;

      const group = row[groupSymbol].value();
      const layer = row[layerSymbol].value();
      const transient = row[transientSymbol].value();

      const context = contexts[layer as Context];
      const color = graphicParameters.groupColours[group - 1];

      const x0 = x - size;
      const x1 = x + size;
      const y0 = y - size;
      const y1 = y + size;

      drawRect(context, x0, y0, x1, y1, { alpha: 1, color });
      if (transient) drawRect(context, x0, y0, x1, y1, transientOptions);
    }
  }

  checkSelection(coords: [number, number, number, number]) {
    const { partData, scaleX, scaleY, scaleSize, breakWidthX, breakWidthY } =
      this.adapter;

    const data = partData(1);
    const sizeX = Math.min(breakWidthX(), breakWidthY()) / 2;

    const selX = [coords[0], coords[2]] as [number, number];
    const selY = [coords[1], coords[3]] as [number, number];
    const selected = new Set<number>();

    for (const row of data) {
      const x = scaleX(row.x.value());
      const y = scaleY(row.y.value());
      const size = scaleSize(row.size.value()) * sizeX;

      const x0 = x - size;
      const x1 = x + size;
      const y0 = y - size;
      const y1 = y + size;

      if (rectOverlap([x0, x1], [y0, y1], selX, selY)) {
        for (const cs of row[positionsSymbol].value()) selected.add(cs);
      }
    }

    return selected;
  }
}
