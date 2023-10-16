# Plotscape

Plotscape is a TypeScript library designed for making linked interactive plots. Please note that it is still at an experimental stage: functionality is limited and may be subject to change.

Plotscape relies on Solid JS for reactivity and Vite for build process but uses no other packages.

# Quick Start

First initialize a new project with your front-end framework of choice (here using Vite with Bun as runtime):

```
bun create vite my-plotscape-figure
```

Next, change directory, install the required dependencies (i.e. `bun i`), and finally install `plotscape` itself:

```
bun i @abartonicek/plotscape5
```

Now you should be ready to create your first figure (using the `mpg` data set, courtesy of the [ggplot2 R package](https://ggplot2.tidyverse.org/reference/mpg.html)):

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

const mpgJSON = await loadData(
  "https://raw.githubusercontent.com/bartonicek/plotscape5/master/public/mpg.json"
);

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
