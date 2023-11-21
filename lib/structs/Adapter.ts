import { Contexts } from "../dom/plot/Contexts";
import { PlotScales } from "../dom/plot/makeScales";
import { PartitionSet } from "./partitions/PartitionSet";

export class Adapter {
  constructor(
    public contexts: Contexts,
    public partitionSet: PartitionSet<any>,
    public scales: PlotScales
  ) {}

  partData = (depth: number) => this.partitionSet.partData(depth);
  scaleX = (x: any) => this.scales.inner.data.x.pushforward(x);
  scaleY = (y: any) => this.scales.inner.data.y.pushforward(y);
  scaleSize = (size: any) => this.scales.inner.data.size.pushforward(size);
  breakWidthX = () => this.scales.inner.data.x.breakWidth();
  breakWidthY = () => this.scales.inner.data.y.breakWidth();
}
