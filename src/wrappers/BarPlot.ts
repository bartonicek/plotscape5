import { Accessor, createSignal } from "solid-js";
import { Plot } from "../dom/plot/Plot";
import { Scene } from "../dom/scene/Scene";
import Bars from "../representations/Bars";
import { Adapter } from "../structs/Adapter";
import { Dataframe } from "../structs/Dataframe";
import { Factor } from "../structs/factors/Factor";
import { FactorLike } from "../structs/factors/FactorLike";
import { PartitionSet } from "../structs/partitions/PartitionSet";
import { num } from "../structs/scalars/utils";
import { sig } from "../structs/values/utils";
import { NumVariable } from "../structs/variables/NumVariable";
import { StrVariable } from "../structs/variables/StrVariable";
import { allValues, noop, orderBy } from "../utils/funs";
import { Cols, KeysOfType } from "../utils/types";
import { catCount1D } from "./recipes";

export class BarPlot<T extends Cols> {
  data: Dataframe<{ var1: StrVariable }>;
  factors: Accessor<FactorLike<any>>[];
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

    const [labels, setLabels] = createSignal(undefined as undefined | string[]);

    const whole = () => Factor.mono(scene.data.n);
    const factor = () => data.cols.var1.factor(labels());
    const marker = scene.marker.factor;

    this.factors = [whole, factor, marker];
    this.partitionSet = new PartitionSet(this.factors, data).apply(catCount1D);

    const p1 = () => this.partitionSet.partData(1);

    for (const scale of allValues(plot.scales)) {
      scale.data.x = scale.data.x.setValues!(
        sig(() => (p1().cols.x as StrVariable).values())
      );
      scale.data.y = scale.data.y.setDomain!(
        num(0),
        sig(() => (p1().cols.y1 as NumVariable).meta.max)
      );
    }

    this.plot.store.setNormYLower = noop;

    const counts = () => p1().cols.y1.values();
    const labs = () => data.cols.var1.meta.values;
    const orderedLabels = () => orderBy(labs(), counts());

    let orderSwitch = true;

    Object.assign(this.plot.keyActions, {
      KeyO: () => {
        if (orderSwitch) {
          setLabels(orderedLabels());
          orderSwitch = false;
        } else {
          setLabels(labs());
          orderSwitch = true;
        }
      },
    });

    const adapter = new Adapter(plot.contexts, this.partitionSet, plot.scales);
    const bars = new Bars(adapter);

    plot.pushRepresentation(bars);
  }
}
