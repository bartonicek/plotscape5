import { createRoot } from "solid-js";
import { Scene } from "./dom/scene/Scene";
import { Dataframe } from "./structs/Dataframe";
import "./style.css";
import { loadData } from "./utils/funs";
import { BarPlot } from "./wrappers/BarPlot";

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
});

// const [group, setGroup] = createSignal(TRANSIENT);
// const [selected, setSelected] = createSignal(new Set<number>());

// const marker1 = new Marker(10, group, selected);

// createEffect(() => console.log(marker1.indices()));

// setSelected(new Set([1, 2, 3]));
// setGroup(GROUP4);
// setSelected(new Set([3, 4, 5]));
// setGroup(TRANSIENT);
// setSelected(new Set([3, 4]));

// marker1.clearTransient();
// marker1.clearAll();
