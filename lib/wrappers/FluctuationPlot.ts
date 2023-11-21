import { Accessor } from "solid-js";
import { Plot } from "../dom/plot/Plot";
import { Dataframe, Scene } from "../main";
import { Squares } from "../representations/Squares";
import { Adapter } from "../structs/Adapter";
import { ExpanseDiscrete } from "../structs/expanses/ExpanseDiscrete";
import { ExpanseTransformed } from "../structs/expanses/ExpanseSqrt";
import { Factor } from "../structs/factors/Factor";
import { FactorLike } from "../structs/factors/FactorLike";
import { PartitionSet } from "../structs/partitions/PartitionSet";
import { num } from "../structs/scalars/utils";
import { sig } from "../structs/values/utils";
import { StrVariable } from "../structs/variables/StrVariable";
import { allValues } from "../utils/funs";
import { Cols, KeysOfType } from "../utils/types";
import { catCount2D } from "./recipes";

export class FluctuationPlot<T extends Cols> {
  data: Dataframe<{ var1: StrVariable; var2: StrVariable }>;
  factors: Accessor<FactorLike<any>>[];
  plot: Plot;
  partitionSet: PartitionSet<any>;

  constructor(
    public scene: Scene<T>,
    public mappingfn: (cols: Pick<T, KeysOfType<T, StrVariable>>) => {
      var1: StrVariable;
      var2: StrVariable;
    }
  ) {
    this.plot = new Plot(scene);
    this.data = scene.data.select(mappingfn);

    const { data, plot } = this;

    const whole = () => Factor.mono(scene.data.n);
    const factor = () => {
      return Factor.product(data.cols.var1.factor(), data.cols.var2.factor());
    };
    const marker = scene.marker.factor;

    this.factors = [whole, factor, marker];
    this.partitionSet = new PartitionSet(this.factors, data).apply(catCount2D);

    const p1 = () => this.partitionSet.partData(1);

    const xVals = sig(() => p1().cols.x.values());
    const yVals = sig(() => p1().cols.y.values());
    const sizeMax = sig(() => p1().cols.size.meta!.max);

    for (const scale of allValues(plot.scales)) {
      scale.data.x = scale.data.x.setValues!(ExpanseDiscrete.of(xVals));
      scale.data.y = scale.data.y.setValues!(ExpanseDiscrete.of(yVals));
      scale.data.size = scale.data.size.setLimits!(
        ExpanseTransformed.of(num(0), sizeMax, Math.sqrt)
      );
    }

    const adapter = new Adapter(plot.contexts, this.partitionSet, plot.scales);
    const squares = new Squares(adapter);

    plot.pushRepresentation(squares);
  }
}
