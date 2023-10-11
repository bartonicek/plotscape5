import { Accessor, Setter, createSignal } from "solid-js";
import graphicParameters from "../dom/graphicParameters";
import { Context } from "../dom/plot/Context";
import { Adapter } from "../structs/Adapter";
import { groups } from "../structs/MarkerDeprecated";
import {
  groupSymbol,
  layerSymbol,
  positionsSymbol,
  transientSymbol,
} from "../structs/Symbols";
import { drawClear, drawRect } from "../utils/drawfuns";
import { lazy, rectOverlap } from "../utils/funs";
import { Representation } from "./Representation";
import { transientOptions } from "./transientOpts";

export default class Bars implements Representation {
  widthPct: Accessor<number>;
  setWidthPct: Setter<number>;

  constructor(private adapter: Adapter) {
    const [widthPct, setWidthPct] = createSignal(graphicParameters.width);
    this.widthPct = widthPct;
    this.setWidthPct = setWidthPct;
  }

  draw = () => {
    const { contexts, partData, scaleX, scaleY } = this.adapter;
    const widthPct = this.widthPct();

    const data1 = partData(1);
    const data2 = partData(2);

    const initx1 = scaleX(data1.row(lazy(1)).x.value());
    const initx0 = scaleX(data1.row(lazy(0)).x.value());

    const width = (initx1 - initx0) * widthPct;

    console.log(data2.unwrapRows());

    // Clear previous paints
    for (const layer of groups) drawClear(contexts[layer]);

    for (const row of data2) {
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
    const { partData, scaleX, scaleY } = this.adapter;
    const widthPct = this.widthPct();

    const data = partData(1);

    const initx1 = scaleX(data.row(lazy(1)).x.value());
    const initx0 = scaleX(data.row(lazy(0)).x.value());
    const width = (initx1 - initx0) * widthPct;

    const selX = [coords[0], coords[2]] as [number, number];
    const selY = [coords[1], coords[3]] as [number, number];
    const selectedCases = new Set<number>();

    for (const row of data) {
      const x0 = scaleX(row.x.value()) - width / 2;
      const x1 = scaleX(row.x.value()) + width / 2;
      const y0 = scaleY(row.y0.value());
      const y1 = scaleY(row.y1.value());

      if (rectOverlap([x0, x1], [y0, y1], selX, selY)) {
        for (const cs of row[positionsSymbol].value()) selectedCases.add(cs);
      }
    }

    return selectedCases;
  };
}
