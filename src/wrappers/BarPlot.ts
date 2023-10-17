import { Accessor, createSignal } from "solid-js";
import { Plot } from "../dom/plot/Plot";
import { Scene } from "../dom/scene/Scene";
import Bars from "../representations/Bars";
import { Adapter } from "../structs/Adapter";
import { Dataframe } from "../structs/Dataframe";
import { ExpanseDiscrete } from "../structs/expanses/ExpanseDiscrete";
import { ExpanseLinear } from "../structs/expanses/ExpanseLinear";
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

    const p1 = () =>
      this.partitionSet.partData(1) as unknown as Dataframe<{
        x: StrVariable;
        y0: NumVariable;
        y1: NumVariable;
      }>;

    const xVals = sig(() => p1().cols.x.values());
    const yMax = sig(() => p1().cols.y1.meta.max);

    for (const scale of allValues(plot.scales)) {
      scale.data.x = scale.data.x.setValues!(ExpanseDiscrete.of(xVals));
      scale.data.y = scale.data.y.setLimits!(ExpanseLinear.of(num(0), yMax));
    }

    this.plot.store.setNormYLower = noop;

    const counts = () => p1().cols.y1.values();
    const labs = () => data.cols.var1.meta.values;
    const orderedLabels = () => orderBy(labs(), counts());

    let isOrdered = false;

    Object.assign(this.plot.keyActions, {
      KeyO: () => {
        if (!isOrdered) {
          setLabels(orderedLabels());
          isOrdered = true;
        } else {
          setLabels(labs());
          isOrdered = false;
        }
      },
    });

    const adapter = new Adapter(plot.contexts, this.partitionSet, plot.scales);
    const bars = new Bars(adapter);

    plot.pushRepresentation(bars);
  }
}
