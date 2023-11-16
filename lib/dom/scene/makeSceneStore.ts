import { createSignal } from "solid-js";
import { TRANSIENT } from "../../structs/Marker";

const makeSceneStore = () => {
  const [group, setGroup] = createSignal(TRANSIENT);
  const [selected, setSelected] = createSignal(new Set<number>());

  return { group, selected, setGroup, setSelected };
};

export default makeSceneStore;
export type SceneStore = ReturnType<typeof makeSceneStore>;
1;
