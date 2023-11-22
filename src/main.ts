import { createRoot } from "solid-js";
import { Scene } from "../lib/dom/scene/Scene.ts";
import { Dataframe } from "../lib/structs/Dataframe.ts";
import "../lib/style.css";
import { loadData } from "../lib/utils/funs.ts";
import { Dict } from "../lib/utils/types.ts";
import { BarPlot } from "../lib/wrappers/BarPlot.ts";
import { FluctuationPlot } from "../lib/wrappers/FluctuationPlot.ts";
import { HistoPlot } from "../lib/wrappers/HistoPlot.ts";
import { ScatterPlot } from "../lib/wrappers/ScatterPlot.ts";

const diamondsJSON = await loadData("./testData/diamonds.json");
const app = document.querySelector("#app") as HTMLDivElement;

async function mpgTest() {
  const mpgJSON = await loadData("../testData/mpg.json");

  const schemeMpg = {
    cyl: "discrete",
    manufacturer: "discrete",
    year: "discrete",
    hwy: "numeric",
    displ: "numeric",
  } as const;

  const dataMpg = Dataframe.parseCols(mpgJSON, schemeMpg);

  createRoot(() => {
    const scene = new Scene(app, dataMpg);
    const plot2 = new BarPlot(scene, (d) => ({ var1: d.manufacturer }));
    const plot3 = new HistoPlot(scene, (d) => ({ var1: d.hwy }));
    const plot4 = new ScatterPlot(scene, (d) => ({
      var1: d.displ,
      var2: d.hwy,
    }));

    const plot5 = new FluctuationPlot(scene, (d) => ({
      var1: d.year,
      var2: d.cyl,
    }));
  });
}

async function diamondsTest() {
  const diamondsJSON = (await loadData("./testData/diamonds.json")) as Dict;
  const [n, pct] = [Object.values(diamondsJSON)[0].length, 0.25];
  const nums = Array.from(Array(n), () => Math.random());

  for (const [k, v] of Object.entries(diamondsJSON)) {
    // @ts-ignore
    diamondsJSON[k] = v.filter((_, i) => nums[i] > 1 - pct);
  }

  const schemeDiamonds = {
    carat: "numeric",
    price: "numeric",
    color: "discrete",
    cut: "discrete",
  } as const;

  const dataDiamonds = Dataframe.parseCols(diamondsJSON, schemeDiamonds);

  createRoot(() => {
    const scene = new Scene(app, dataDiamonds);
    const plot1 = new ScatterPlot(scene, (d) => ({
      var1: d.carat,
      var2: d.price,
    }));
    const plot2 = new BarPlot(scene, (d) => ({ var1: d.cut }));
    const plot3 = new BarPlot(scene, (d) => ({ var1: d.color }));
  });
}

await mpgTest();
// await diamondsTest();
