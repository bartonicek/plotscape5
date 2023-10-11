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
import { rectOverlap } from "../utils/funs";
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

    const rad = radius * radiusMult;

    const data1 = partData(1);
    const data2 = partData(2);

    // Clear previous paints
    for (const layer of groupContexts) drawClear(contexts[layer]);

    for (const row of data2) {
      const x = scaleX(row.x.value());
      const y = scaleY(row.y.value());

      const group = row[groupSymbol].value();
      const layer = row[layerSymbol].value();
      const transient = row[transientSymbol].value();

      const context = contexts[layer as Context];
      const color = graphicParameters.groupColours[group - 1];

      drawPoint(context, x, y, { radius: rad, color });
      if (transient) {
        drawPoint(context, x, y, { ...transientOptions, radius: rad });
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

    for (const row of data) {
      const x = scaleX(row.x.value());
      const y = scaleY(row.y.value());

      if (
        rectOverlap(
          [x - radius, x + radius],
          [y - radius, y + radius],
          selX,
          selY
        )
      ) {
        for (const i of row[positionsSymbol].value()) selected.add(i);
      }
    }

    return selected;
  };
}
