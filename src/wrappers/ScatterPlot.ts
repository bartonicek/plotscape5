import { Plot } from "../dom/plot/Plot";
import { Scene } from "../dom/scene/Scene";
import Points from "../representations/Points";
import { Adapter } from "../structs/Adapter";
import { Dataframe } from "../structs/Dataframe";
import { Factor } from "../structs/Factor";
import { PartitionSet } from "../structs/PartitionSet";
import { sig } from "../structs/Value";
import { NumVariable } from "../structs/Variable";
import { allValues } from "../utils/funs";
import { Cols, KeysOfType } from "../utils/types";

export class ScatterPlot<T extends Cols> {
  data: Dataframe<{ var1: NumVariable; var2: NumVariable }>;
  plot: Plot;
  partitionSet: PartitionSet<any>;

  constructor(
    public scene: Scene<T>,
    public mappingfn: (cols: Pick<T, KeysOfType<T, NumVariable>>) => {
      var1: NumVariable;
      var2: NumVariable;
    }
  ) {
    this.plot = new Plot(scene);
    this.data = scene.data.select(mappingfn);

    const { data, plot } = this;

    const whole = () => Factor.mono(scene.data.n);
    const iso = () => Factor.iso(scene.data.n);
    const marker = scene.marker.factor;

    const factors = [whole, iso, marker];

    const partitionSet = new PartitionSet(factors, data)
      .map(({ var1, var2 }) => ({ x: var1, y: var2 }))
      .update();

    this.partitionSet = partitionSet;

    for (const scale of allValues(plot.scales)) {
      scale.data.x = scale.data.x.setDomain!(
        sig(() => (partitionSet.partData(1).cols.x as NumVariable).meta.min),
        sig(() => (partitionSet.partData(1).cols.x as NumVariable).meta.max)
      );
      scale.data.y = scale.data.y.setDomain!(
        sig(() => (partitionSet.partData(1).cols.y as NumVariable).meta.min),
        sig(() => (partitionSet.partData(1).cols.y as NumVariable).meta.max)
      );
    }

    const adapter = new Adapter(plot.contexts, partitionSet, plot.scales);
    const points = new Points(adapter);

    plot.pushRepresentation(points);
  }
}
