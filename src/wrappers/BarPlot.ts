import { Accessor, createSignal } from "solid-js";
import { Plot } from "../dom/plot/Plot";
import { Scene } from "../dom/scene/Scene";
import Bars from "../representations/Bars";
import { Adapter } from "../structs/Adapter";
import { Dataframe } from "../structs/Dataframe";
import { Factor, FactorLike } from "../structs/Factor";
import { PartitionSet } from "../structs/PartitionSet";
import { num } from "../structs/Scalar";
import { sig } from "../structs/Value";
import { NumVariable, StrVariable } from "../structs/Variable";
import { alNumCompare, allValues, noop, orderBy } from "../utils/funs";
import { Cols, KeysOfType } from "../utils/types";

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

    const partitionSet = new PartitionSet(this.factors, data)
      .reduce(
        ({ count }, {}) => ({ count: count.inc() }),
        () => ({ count: num(0) })
      )
      .map(({ label, count }) => ({ x: label, y0: num(0), y1: count }))
      .stackAt(
        2,
        (parent, part) => ({ y0: parent.y1, y1: parent.y1.add(part.y1) }),
        () => ({ y0: num(0), y1: num(0) })
      )
      .update();

    this.partitionSet = partitionSet;

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
    const labs = () => p1().cols.x.values();
    const orderedLabels = () => orderBy(labs(), counts());

    let orderSwitch = true;

    Object.assign(this.plot.keyActions, {
      KeyO: () => {
        if (orderSwitch) {
          setLabels(orderedLabels());
          orderSwitch = false;
        } else {
          setLabels(labs().sort(alNumCompare));
          orderSwitch = true;
        }
      },
    });

    const adapter = new Adapter(plot.contexts, partitionSet, plot.scales);
    const bars = new Bars(adapter);

    plot.pushRepresentation(bars);
  }
}
