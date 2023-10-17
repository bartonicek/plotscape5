import { createEffect } from "solid-js";
import html from "solid-js/html";
import { num } from "../../structs/scalars/utils";
import { ScaleLike } from "../../structs/scales/ScaleLike";
import { ScalePlaceholder } from "../../structs/scales/ScalePlaceholder";
import { ValueLike } from "../../structs/values/ValueLike";
import { sig } from "../../structs/values/utils";
import { unwrap } from "../../utils/funs";
import { Plot } from "../plot/Plot";

type LayerOptions = {
  inner: boolean;
  scalingFactor?: number;
  classes?: string[];
};

export class ContextLayer {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  scalingFactor: number;

  left: ValueLike<number>;
  top: ValueLike<number>;
  width: ValueLike<number>;
  height: ValueLike<number>;

  scales: Record<string, Record<string, ScaleLike>>;

  constructor(plot: Plot, options: LayerOptions) {
    this.canvas = html`<canvas />` as HTMLCanvasElement;
    this.context = this.canvas.getContext("2d")!;
    this.scalingFactor = options.scalingFactor ?? 3;
    if (options.classes) {
      for (const cssClass of options.classes) {
        this.canvas.classList.add(`plotscape-${cssClass}`);
      }
    }

    plot.container.appendChild(this.canvas);

    const { store } = plot;
    this.left = options.inner ? sig(store.marginLeft) : num(0);
    this.top = options.inner ? sig(store.marginTop) : num(0);
    this.width = options.inner ? sig(store.innerWidth) : sig(store.width);
    this.height = options.inner ? sig(store.innerHeight) : sig(store.height);

    const [inOut] = options.inner ? "inner" : "outer";
    const codomain = plot.expanses[options.inner ? "inner" : "outer"];

    this.scales = {
      data: {
        x: ScalePlaceholder.default().setCodomain(
          codomain.horizontal.lower,
          codomain.horizontal.upper
        ),
        y: ScalePlaceholder.default(),
      },
    };

    createEffect(this.resize);
  }

  resize = () => {
    const { left, top, width, height, scalingFactor, canvas } = this;
    const [w, h, l, t] = [width, height, left, top].map(unwrap);
    canvas.style.width = w + `px`;
    canvas.style.height = h + `px`;
    canvas.style.marginLeft = l + "px";
    canvas.style.marginTop = t + "px";
    canvas.width = Math.ceil(w * scalingFactor);
    canvas.height = Math.ceil(h * scalingFactor);
    this.context.scale(scalingFactor, scalingFactor);
  };
}
