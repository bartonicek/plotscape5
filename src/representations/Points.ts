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
  radiusPct: Accessor<number>;
  setRadiusPct: Setter<number>;
  keyActions: Record<string, any>;

  constructor(private adapter: Adapter) {
    const [widthPct, setWidthPct] = createSignal(1);
    this.radiusPct = widthPct;
    this.setRadiusPct = setWidthPct;
    this.keyActions = {
      Equal: () => this.setRadiusPct((r) => (r * 10) / 9),
      Minus: () => this.setRadiusPct((r) => (r * 9) / 10),
    };
  }

  draw = () => {
    const { contexts, partData, scaleX, scaleY } = this.adapter;
    const radiusPct = this.radiusPct();
    const { radius } = graphicParameters;

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

      drawPoint(context, x, y, { radius: radiusPct * radius, color });
      if (transient) drawPoint(context, x, y, transientOptions);
    }
  };

  checkSelection = (coords: [number, number, number, number]) => {
    const { partData, scaleX, scaleY } = this.adapter;
    const radius = this.radiusPct();

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
