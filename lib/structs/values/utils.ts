import { Accessor } from "solid-js";
import { Lazy } from "../../utils/types";
import { Signal } from "./Signal";
import { Value } from "./Value";
import { View } from "./View";

export const val = <T>(x: T) => new Value(x);
export const sig = <T>(getter: Accessor<T>) => new Signal(getter);
export const view = <T>(array: T[], indexfn: Lazy<number>) => {
  return new View(array, indexfn);
};
