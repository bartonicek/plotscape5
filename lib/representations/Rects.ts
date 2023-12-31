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

export default class Rects implements Representation {
  constructor(private adapter: Adapter) {}

  draw = () => {
    const { contexts, partData, scaleX, scaleY } = this.adapter;
    const data = partData(2);

    // Clear previous paints
    for (const layer of groupContexts) drawClear(contexts[layer]);

    for (const row of data) {
      const x0 = scaleX(row.x0.value());
      const x1 = scaleX(row.x1.value());
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
    const { partData, scaleX, scaleY } = this.adapter;

    const data = partData(1);

    const selX = [coords[0], coords[2]] as [number, number];
    const selY = [coords[1], coords[3]] as [number, number];
    const selected = new Set<number>();

    for (const row of data) {
      const x0 = scaleX(row.x0.value());
      const x1 = scaleX(row.x1.value());
      const y0 = scaleY(row.y0.value());
      const y1 = scaleY(row.y1.value());

      if (rectOverlap([x0, x1], [y0, y1], selX, selY)) {
        for (const cs of row[positionsSymbol].value()) selected.add(cs);
      }
    }

    return selected;
  };

  queryAt = (x: number, y: number) => {
    const { partData, scaleX, scaleY } = this.adapter;

    const data = partData(1);

    for (const row of data) {
      const x0 = scaleX(row.x0.value());
      const x1 = scaleX(row.x1.value());
      const y0 = scaleY(row.y0.value());
      const y1 = scaleY(row.y1.value());

      if (pointInRect([x, y], [x0, y0, x1, y1])) return row;
    }
  };
}
