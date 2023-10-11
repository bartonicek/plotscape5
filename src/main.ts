import { createRoot } from "solid-js";
import { Scene } from "./dom/scene/Scene";
import { Dataframe } from "./structs/Dataframe";
import "./style.css";
import { loadData } from "./utils/funs";
import { BarPlot } from "./wrappers/BarPlot";
import { HistoPlot } from "./wrappers/HistoPlot";

const mtcarsJSON = await loadData("./testData/mtcars.json");

const dataMtcars = Dataframe.parseCols(mtcarsJSON, {
  am: "discrete",
  cyl: "discrete",
  mpg: "numeric",
});

const app = document.querySelector("#app") as HTMLDivElement;

createRoot(() => {
  const scene = new Scene(app, dataMtcars);
  const plot1 = new BarPlot(scene, (d) => ({ var1: d.cyl }));
  const plot2 = new BarPlot(scene, (d) => ({ var1: d.am }));
  const plot3 = new HistoPlot(scene, (d) => ({ var1: d.mpg }));
});
