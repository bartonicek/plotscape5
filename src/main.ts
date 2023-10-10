import { createRoot } from "solid-js";
import { Scene } from "./dom/scene/Scene";
import { Dataframe } from "./structs/Dataframe";
import "./style.css";
import { loadData } from "./utils/funs";
import { BarPlot } from "./wrappers/BarPlot";

const mpgJSON = await loadData("./testData/mpg.json");

console.log(mpgJSON);

const dataMpg = Dataframe.parseCols(mpgJSON, {
  class: "discrete",
  displ: "numeric",
  hwy: "numeric",
  manufacturer: "discrete",
});

const app = document.querySelector("#app") as HTMLDivElement;

createRoot(() => {
  const scene = new Scene(app, dataMpg);
  const plot1 = new BarPlot(scene, (d) => ({ var1: d.manufacturer }));
});
