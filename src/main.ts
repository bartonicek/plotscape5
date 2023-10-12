import { createRoot } from "solid-js";
import { Scene } from "./dom/scene/Scene";
import { Dataframe } from "./structs/Dataframe";
import "./style.css";
import { loadData } from "./utils/funs";
import { BarPlot } from "./wrappers/BarPlot";
import { HistoPlot } from "./wrappers/HistoPlot";
import { ScatterPlot } from "./wrappers/ScatterPlot";

const mtcarsJSON = await loadData("./testData/mpg.json");
const diamondsJSON = await loadData("./testData/diamonds.json");

const schemeMtcars = {
  cyl: "discrete",
  manufacturer: "discrete",
  hwy: "numeric",
  displ: "numeric",
} as const;

const schemeDiamonds = {
  carat: "numeric",
  price: "numeric",
  color: "discrete",
  cut: "discrete",
} as const;

const dataMtcars = Dataframe.parseCols(mtcarsJSON, schemeMtcars);
const dataDiamonds = Dataframe.parseCols(diamondsJSON, schemeDiamonds);

const app = document.querySelector("#app") as HTMLDivElement;

createRoot(() => {
  const scene = new Scene(app, dataMtcars);
  const plot1 = new BarPlot(scene, (d) => ({ var1: d.cyl }));
  const plot2 = new BarPlot(scene, (d) => ({ var1: d.manufacturer }));
  const plot3 = new HistoPlot(scene, (d) => ({ var1: d.hwy }));
  const plot4 = new ScatterPlot(scene, (d) => ({ var1: d.displ, var2: d.hwy }));

  //   const scene2 = new Scene(app, dataDiamonds);
  //   const plot1 = new ScatterPlot(scene2, (d) => ({
  //     var1: d.carat,
  //     var2: d.price,
  //   }));
  //   const plot2 = new BarPlot(scene2, (d) => ({ var1: d.cut }));
  //   const plot3 = new BarPlot(scene2, (d) => ({ var1: d.color }));
});
