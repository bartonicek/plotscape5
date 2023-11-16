import { Dataframe } from "../../structs/Dataframe";
import {
  GROUP2,
  GROUP3,
  GROUP4,
  Marker,
  TRANSIENT,
} from "../../structs/Marker";
import { drawClear } from "../../utils/drawfuns";
import { Cols } from "../../utils/types";
import { Plot } from "../plot/Plot";
import makeSceneStore, { SceneStore } from "./makeSceneStore";

const isScene = (target: Element) => {
  return target.classList.contains("plotscape-scene");
};

export class Scene<T extends Cols> {
  nPlots: number;
  nCols: number;
  nRows: number;

  plots: Plot[];

  marker: Marker;
  store: SceneStore;

  keyActions: Record<string, () => void>;

  constructor(public app: HTMLDivElement, public data: Dataframe<T>) {
    this.app.classList.add("plotscape-scene");

    this.nPlots = 0;
    this.nCols = 0;
    this.nRows = 0;

    const store = makeSceneStore();
    this.store = store;
    this.marker = new Marker(data.n, store.group, store.selected);

    this.plots = [];

    this.keyActions = {
      Digit1: () => this.store.setGroup(GROUP2),
      Digit2: () => this.store.setGroup(GROUP3),
      Digit3: () => this.store.setGroup(GROUP4),
    };

    this.app.addEventListener("mousedown", this.onMouseDown);
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("dblclick", this.onDoubleClick);
  }

  setRowsCols = (rows: number, cols: number) => {
    document.documentElement.style.setProperty("--ncols", cols.toString());
    document.documentElement.style.setProperty("--nrows", rows.toString());
    for (const plot of this.plots) plot.resize();
  };

  pushPlot = (plot: Plot) => {
    this.plots.push(plot);

    this.nPlots++;
    this.nCols = Math.ceil(Math.sqrt(this.nPlots));
    this.nRows = Math.ceil(this.nPlots / this.nCols);

    this.setRowsCols(this.nRows, this.nCols);
  };

  deactivateAll = () => {
    for (const plot of this.plots) plot.deactivate();
  };

  onMouseDown = (event: MouseEvent) => {
    // Clear drag rectangles
    for (const plot of this.plots) drawClear(plot.contexts.user);

    const { target } = event;
    // Only deactivate if clicked outside of any plot area
    if (target instanceof Element && isScene(target)) this.deactivateAll();
  };

  onDoubleClick = () => {
    this.deactivateAll();
    this.marker.clearAll();
    this.store.setGroup(TRANSIENT);
    this.store.setSelected(new Set<number>());
  };

  onKeyDown = (event: KeyboardEvent) => {
    const key = event.code;
    this.keyActions[key]?.();
  };

  onKeyUp = () => {
    this.store.setGroup(TRANSIENT);
  };
}
