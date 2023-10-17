import { batch, createEffect } from "solid-js";
import html from "solid-js/html";
import { AxisLabels } from "../../decorations/AxisLabels";
import { Decoration } from "../../decorations/Decoration";
import { Representation } from "../../representations/Representation";
import { TRANSIENT } from "../../structs/Marker";
import { drawClear, drawRect } from "../../utils/drawfuns";
import {
  allEntries,
  asInt,
  call,
  inSequence,
  throttle,
} from "../../utils/funs";
import { Scene } from "../scene/Scene";
import { Contexts, contexts } from "./Contexts";
import { makeCanvasContext } from "./makeCanvasContext";
import { PlotExpanses, makeExpanses } from "./makeExpanses";
import { PlotStore, makePlotStore } from "./makePlotStore";
import { PlotScales, makeScales } from "./makeScales";
import { reset, zoom } from "./plotKeyActions";

export class Plot {
  container: HTMLDivElement;

  store: PlotStore;
  expanses: PlotExpanses;
  scales: PlotScales;
  contexts: Contexts;

  representations: Representation[];
  decorations: Decoration[];

  keyActions: Record<string, () => void>;

  constructor(public scene: Scene<any>) {
    const container = html`<div
      class="plotscape-container"
    ></div>` as HTMLDivElement;
    this.container = container;
    scene.app.appendChild(container);

    window.addEventListener("resize", throttle(this.onResize, 50));
    container.addEventListener("mousedown", this.onMouseDown);

    // container.addEventListener("mousedown", this.state.dispatch);

    container.addEventListener("contextmenu", this.onContextMenu);
    container.addEventListener("mouseup", this.onMouseUp);
    container.addEventListener("mousemove", throttle(this.onMouseMove, 30));
    window.addEventListener("keydown", throttle(this.onKeyDown, 50));

    const store = makePlotStore();
    const expanses = makeExpanses(store);
    const scales = makeScales(expanses);

    this.store = store;
    this.expanses = expanses;
    this.scales = scales;

    this.contexts = {} as Contexts;
    for (const ctx of contexts) {
      const opts = { inner: ctx != "over", classes: [`${ctx}`] };
      this.contexts[ctx] = makeCanvasContext(this, opts);
    }

    this.representations = [];
    this.decorations = [];

    this.pushDecoration(new AxisLabels(this, "x"));
    this.pushDecoration(new AxisLabels(this, "y"));

    this.keyActions = {
      KeyR: () => reset(this),
      KeyZ: () => zoom(this),
    };

    scene.pushPlot(this);
  }

  pushRepresentation = (representation: Representation) => {
    this.representations.push(representation);
    const keyActions = representation.keyActions;
    if (keyActions) {
      for (const [k, newCb] of allEntries(keyActions)) {
        const oldCb = this.keyActions[k];
        this.keyActions[k] = oldCb ? inSequence(oldCb, newCb) : newCb;
      }
    }
    createEffect(() => representation.draw());
  };

  pushDecoration = (decoration: Decoration) => {
    this.decorations.push(decoration);
    createEffect(() => decoration.draw());
  };

  resize = () => this.onResize();

  activate = () => {
    this.store.setActive(true);
    this.container.classList.add("active");
  };

  deactivate = () => {
    this.store.setActive(false);
    this.container.classList.remove("active");
    drawClear(this.contexts.user);
  };

  onResize = () => {
    const { setWidth, setHeight } = this.store;
    setWidth(asInt(getComputedStyle(this.container)["width"]));
    setHeight(asInt(getComputedStyle(this.container)["height"]));
    this.scene.marker.clearTransient();

    for (const rep of this.representations) rep.draw();
    for (const dec of this.decorations) dec.draw();
  };

  onMouseDown = (event: MouseEvent) => {
    const {
      height,
      marginBottom,
      marginLeft,
      setHolding,
      setClickX,
      setClickY,
      setMouseX,
      setMouseY,
    } = this.store;

    for (const plot of this.scene.plots) plot.deactivate();
    // this.scene.marker.clearTransient();
    this.activate();

    const x = event.offsetX - marginLeft();
    const y = height() - event.offsetY - marginBottom();

    setHolding(true);
    batch(() => {
      setClickX(x), setClickY(y), setMouseX(x), setMouseY(y);
    });

    const { setSelected: setSelectedCases } = this.scene.store;

    if (event.button === 0) {
      this.representations.forEach((rep) =>
        setSelectedCases(rep.checkSelection([x, y, x, y]))
      );
    }
  };

  onContextMenu = (event: MouseEvent) => {
    event.preventDefault();
    this.store.setRightButtonClicked(true);
  };

  onMouseUp = () => {
    this.store.setRightButtonClicked(false);
    this.store.setHolding(false);
  };

  onMouseMove = (event: MouseEvent) => {
    const { store, contexts, scene, representations } = this;

    if (!store.holding()) return;

    const { height, marginLeft, marginBottom, setMouseX, setMouseY } = store;

    const x = event.offsetX - marginLeft();
    const y = height() - event.offsetY - marginBottom();

    if (store.rightButtonClicked()) {
      const { mouseX, mouseY, width, height } = store;

      const xMove = (x - mouseX()) / width();
      const yMove = (y - mouseY()) / height();

      store.setNormXLower((val) => val + xMove);
      store.setNormXUpper((val) => val + xMove);
      store.setNormYLower((val) => val + yMove);
      store.setNormYUpper((val) => val + yMove);

      batch(() => {
        setMouseX(x), setMouseY(y);
      });

      return;
    }

    // Draw the selection rectangle
    const { clickX, clickY, mouseX, mouseY } = store;
    const [x0, x1, y0, y1] = [clickX, mouseX, clickY, mouseY].map(call);

    drawClear(contexts.user);
    drawRect(contexts.user, x0, y0, x1, y1, { alpha: 0.25 });

    scene.marker.clearTransient();

    batch(() => {
      setMouseX(x), setMouseY(y);
    });

    for (const rep of representations) {
      scene.store.setSelected(rep.checkSelection([x0, y0, x1, y1]));
    }
  };

  onKeyDown = (event: KeyboardEvent) => {
    if (!this.store.active()) return;
    this.keyActions[event.code]?.();
  };

  onKeyUp = () => {
    this.scene.store.setGroup(TRANSIENT);
  };
}
