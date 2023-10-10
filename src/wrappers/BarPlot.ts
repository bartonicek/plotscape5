import { Plot } from "../dom/plot/Plot";
import { Scene } from "../dom/scene/Scene";
import Bars from "../representations/Bars";
import { Adapter } from "../structs/Adapter";
import { Dataframe } from "../structs/Dataframe";
import { Factor } from "../structs/Factor";
import { PartitionSet } from "../structs/PartitionSet";
import { num } from "../structs/Scalar";
import { sig } from "../structs/Value";
import { NumVariable, StrVariable } from "../structs/Variable";
import { allValues, noop } from "../utils/funs";
import { Cols, KeysOfType } from "../utils/types";

export class BarPlot<T extends Cols> {
  data: Dataframe<{ var1: StrVariable }>;
  plot: Plot;
  partitionSet: PartitionSet<any>;

  constructor(
    public scene: Scene<T>,
    public mappingfn: (cols: Pick<T, KeysOfType<T, StrVariable>>) => {
      var1: StrVariable;
    }
  ) {
    this.plot = new Plot(scene);
    this.data = scene.data.select(mappingfn);

    const { data, plot } = this;

    const whole = () => Factor.mono(scene.data.n);
    const factor = data.cols.var1.factor;
    const marker = scene.marker.factor;

    const factors = [whole, factor, marker];

    const partitionSet = new PartitionSet(factors, data)
      .reduce(
        ({ sum }, {}) => ({ sum: sum.inc() }),
        () => ({ sum: num(0) })
      )
      .map(({ label, sum }) => ({ x: label, y0: num(0), y1: sum }))
      .stackAt(
        2,
        (parent, part) => ({ y0: parent.y1, y1: parent.y1.add(part.y1) }),
        () => ({ y0: num(0), y1: num(0) })
      )
      .update();

    this.partitionSet = partitionSet;

    for (const scale of allValues(plot.scales)) {
      scale.data.x = scale.data.x.setValues!(
        sig(() =>
          Array.from(
            (partitionSet.partData(1).cols.x as StrVariable).meta.values
          )
        )
      );
      scale.data.y = scale.data.y.setDomain!(
        num(0),
        sig(() => (partitionSet.partData(1).cols.y1 as NumVariable).meta.max)
      );
    }

    this.plot.store.setNormYLower = noop;

    const adapter = new Adapter(plot.contexts, partitionSet, plot.scales);
    const bars = new Bars(adapter);

    plot.pushRepresentation(bars);
  }
}
