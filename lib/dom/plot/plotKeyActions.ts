import { batch } from "solid-js";
import { drawClear } from "../../utils/drawfuns";
import { minMax, unwrapAll } from "../../utils/funs";
import graphicParameters from "../graphicParameters";
import { Plot } from "./Plot";

export function reset(plot: Plot) {
  const { defaultNorm } = graphicParameters;
  plot.store.setNormXLower(defaultNorm.x.lower);
  plot.store.setNormYLower(defaultNorm.y.lower);
  plot.store.setNormXUpper(defaultNorm.x.upper);
  plot.store.setNormYUpper(defaultNorm.y.upper);
}

export function zoom(plot: Plot) {
  const { store, contexts, expanses } = plot;
  const [clickX, clickY, mouseX, mouseY] = [
    store.clickX(),
    store.clickY(),
    store.mouseX(),
    store.mouseY(),
  ];
  const { innerH, innerV, normX, normY } = expanses;

  if (Math.abs(mouseX - clickX) < 10 || Math.abs(mouseY - clickY) < 10) {
    return;
  }

  const [xMin, xMax] = minMax([clickX, mouseX]);
  const [yMin, yMax] = minMax([clickY, mouseY]);

  const xLower = normX.normalize(innerH.normalize(xMin));
  const xUpper = normX.normalize(innerH.normalize(xMax));
  const yLower = normY.normalize(innerV.normalize(yMin));
  const yUpper = normY.normalize(innerV.normalize(yMax));

  // Need to invert: e.g. if xLower is 0.3,
  // then norm.unnormalize(0.3) should be 0
  const xRange = 1 / (xUpper - xLower);
  const yRange = 1 / (yUpper - yLower);

  batch(() => {
    store.setNormXLower(-xLower * xRange);
    store.setNormXUpper(-xLower * xRange + xRange);
    store.setNormYLower(-yLower * yRange);
    store.setNormYUpper(-yLower * yRange + yRange);
  });

  plot.scene.marker.clearTransient();
  drawClear(contexts.user);
}

export function query(plot: Plot) {
  const { store, representations } = plot;
  const [mouseX, mouseY, innerHeight, marginLeft] = [
    store.mouseX(),
    store.mouseY(),
    store.innerHeight(),
    store.marginLeft(),
  ];

  let result;

  for (const rep of representations) {
    result = unwrapAll(rep.queryAt(mouseX, mouseY) ?? {});
  }

  let string = "";
  for (const [k, v] of Object.entries(result ?? {})) string += `${k}: ${v}<br>`;
  plot.query.innerHTML = string;

  plot.query.style.left = `${mouseX + marginLeft}px`;
  plot.query.style.top = `${innerHeight - mouseY}px`;
  plot.query.style.display = `inline-block`;
}
