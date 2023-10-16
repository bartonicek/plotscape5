# Plotscape

Plotscape is a TypeScript library designed for making linked interactive plots. Please note that it is still at an experimental stage: functionality is limited and may be subject to change.

Plotscape relies on Solid JS for reactivity and Vite for build process but uses no other packages.

# Quick Start

To install, run in terminal:

```
npm i @abartonicek/plotscape5
```

Assuming you have `mpg.json` dataset (from the (ggplot2 package)[https://ggplot2.tidyverse.org/reference/mpg.html]) in the root directory of your project:

```ts
import {
  BarPlot,
  Dataframe,
  HistoPlot,
  ScatterPlot,
  Scene,
  createRoot,
  loadData,
} from "@abartonicek/plotscape5";

const mpgJSON = await loadData("./mpg.json");
const schemeMpg = {
  cyl: "discrete",
  manufacturer: "discrete",
  hwy: "numeric",
  displ: "numeric",
} as const;

const dataMpg = Dataframe.parseCols(mpgJSON, schemeMpg);
const app = document.querySelector("#app") as HTMLDivElement;

// createRoot is exported directly from Solid JS
createRoot(() => {
  const scene = new Scene(app, dataMpg);
  const plot1 = new BarPlot(scene, (d) => ({ var1: d.cyl }));
  const plot2 = new BarPlot(scene, (d) => ({ var1: d.manufacturer }));
  const plot3 = new HistoPlot(scene, (d) => ({ var1: d.hwy }));
  const plot4 = new ScatterPlot(scene, (d) => ({ var1: d.displ, var2: d.hwy }));
});
```

Live demo is available at: TODO
