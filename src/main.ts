import { createRoot } from "solid-js";
import { Scene } from "./dom/scene/Scene";
import { Dataframe } from "./structs/Dataframe";
import "./style.css";
import { loadData } from "./utils/funs";
import { BarPlot } from "./wrappers/BarPlot";
import { HistoPlot } from "./wrappers/HistoPlot";

const mtcarsJSON = await loadData("./testData/mpg.json");

console.log(mtcarsJSON);

const dataMtcars = Dataframe.parseCols(mtcarsJSON, {
  cyl: "discrete",
  manufacturer: "discrete",
  hwy: "numeric",
  displ: "numeric",
});

const app = document.querySelector("#app") as HTMLDivElement;

createRoot(() => {
  const scene = new Scene(app, dataMtcars);
  const plot1 = new BarPlot(scene, (d) => ({ var1: d.cyl }));
  const plot2 = new BarPlot(scene, (d) => ({ var1: d.manufacturer }));
  const plot3 = new HistoPlot(scene, (d) => ({ var1: d.hwy }));
  //   const plot4 = new ScatterPlot(scene, (d) => ({ var1: d.disp, var2: d.mpg }));
});

// const x = new None();
// const y = num(0);

// try {
//   x.add(y);
// } catch {
//   console.log("Can't do that Dave!");
// }
