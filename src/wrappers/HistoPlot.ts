import { createSignal } from "solid-js";
import { Plot } from "../dom/plot/Plot";
import { Scene } from "../dom/scene/Scene";
import Rects from "../representations/Rects";
import { Adapter } from "../structs/Adapter";
import { Dataframe } from "../structs/Dataframe";
import { Factor } from "../structs/factors/Factor";
import { PartitionSet } from "../structs/partitions/PartitionSet";
import { num } from "../structs/scalars/utils";
import { sig } from "../structs/values/utils";
import { NumVariable } from "../structs/variables/NumVariable";
import { noop } from "../utils/funs";
import { Cols, KeysOfType } from "../utils/types";
import { binCount1D } from "./recipes";

export class HistoPlot<T extends Cols> {
  plot: Plot;
  data: Dataframe<{ var1: NumVariable }>;
  partitionSet: PartitionSet<any>;

  constructor(
    public scene: Scene<T>,
    public mappingfn: (cols: Pick<T, KeysOfType<T, NumVariable>>) => {
      var1: NumVariable;
    }
  ) {
    this.plot = new Plot(scene);
    this.data = scene.data.select(mappingfn);

    const { data, plot } = this;
    const { keyActions } = plot;

    const { min, max } = data.cols.var1.meta;
    const range = max - min;

    const [width, setWidth] = createSignal(range / 20);
    const [anchor, setAnchor] = createSignal(min);

    keyActions["Equal"] = () => setWidth((w) => (w * 10) / 9);
    keyActions["Minus"] = () => setWidth((w) => (w * 9) / 10);
    keyActions["BracketRight"] = () => setAnchor((a) => a + 1);
    keyActions["BracketLeft"] = () => setAnchor((a) => a - 1);

    const whole = () => Factor.mono(data.n);
    const bins = () => data.cols.var1.bin(sig(width), sig(anchor));
    const marker = scene.marker.factor;

    const factors = [whole, bins, marker];
    this.partitionSet = new PartitionSet(factors, data).apply(binCount1D);
    const p1 = () => this.partitionSet.partData(1);

    for (const scale of Object.values(plot.scales)) {
      scale.data.x = scale.data.x.setDomain!(
        sig(() => (p1().cols.x0 as NumVariable).meta.min),
        sig(() => (p1().cols.x1 as NumVariable).meta.max)
      );
      scale.data.y = scale.data.y.setDomain!(
        num(0),
        sig(() => (p1().cols.y1 as NumVariable).meta.max)
      );
    }

    this.plot.store.setNormYLower = noop;

    const adapter = new Adapter(plot.contexts, this.partitionSet, plot.scales);
    const bars = new Rects(adapter);

    plot.pushRepresentation(bars);
  }
}
