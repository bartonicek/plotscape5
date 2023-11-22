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
import { drawClear, drawPoint } from "../utils/drawfuns";
import { pointInRect, rectOverlap } from "../utils/funs";
import { Representation } from "./Representation";
import { transientOptions } from "./transientOpts";

export default class Points implements Representation {
  radiusMult: Accessor<number>;
  setRadiusMult: Setter<number>;
  keyActions: Record<string, any>;

  constructor(private adapter: Adapter) {
    const [radius, setRadius] = createSignal(1);
    this.radiusMult = radius;
    this.setRadiusMult = setRadius;
    this.keyActions = {
      Equal: () => this.setRadiusMult((r) => (r * 10) / 9),
      Minus: () => this.setRadiusMult((r) => (r * 9) / 10),
      KeyR: () => this.setRadiusMult(1),
    };
  }

  draw = () => {
    const { contexts, partData, scaleX, scaleY } = this.adapter;
    const radiusMult = this.radiusMult();
    const { radius } = graphicParameters;

    const data = partData(2);
    const rad = radius * radiusMult;

    // Clear previous paints
    for (const layer of groupContexts) drawClear(contexts[layer]);

    const { height } = contexts["base"].canvas.getBoundingClientRect();

    for (const row of data) {
      const x = scaleX(row.x.value());
      const y = scaleY(row.y.value());

      const group = row[groupSymbol].value();
      const layer = row[layerSymbol].value();
      const transient = row[transientSymbol].value();

      const context = contexts[layer as Context];
      const color = graphicParameters.groupColours[group - 1];

      drawPoint(context, x, height - y, { radius: rad, color });
      if (transient) {
        drawPoint(context, x, height - y, { ...transientOptions, radius: rad });
      }
    }
  };

  checkSelection = (coords: [number, number, number, number]) => {
    const { partData, scaleX, scaleY } = this.adapter;
    const radius = this.radiusMult();

    const data = partData(1);

    const selX = [coords[0], coords[2]] as [number, number];
    const selY = [coords[1], coords[3]] as [number, number];
    const selected = new Set<number>();

    const m = Math.sqrt(2);

    let i = 0;

    for (const row of data) {
      const x = scaleX(row.x.value());
      const y = scaleY(row.y.value());

      const x0x1 = [x - m * radius, x + m * radius] as [number, number];
      const y0y1 = [y - m * radius, y + m * radius] as [number, number];

      if (rectOverlap(x0x1, y0y1, selX, selY)) {
        for (const i of row[positionsSymbol].value()) selected.add(i);
      }

      i++;
    }

    return selected;
  };

  queryAt = (x: number, y: number) => {
    const { partData, scaleX, scaleY } = this.adapter;
    const radius = this.radiusMult();

    const data = partData(1);
    const m = Math.sqrt(2);

    for (const row of data) {
      const xx = scaleX(row.x.value());
      const yy = scaleY(row.y.value());

      const x0 = xx - m * radius;
      const x1 = xx + m * radius;
      const y0 = yy - m * radius;
      const y1 = yy + m * radius;

      if (pointInRect([x, y], [x0, y0, x1, y1])) return row;
    }
  };
}
