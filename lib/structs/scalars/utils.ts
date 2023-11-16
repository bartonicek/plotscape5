import { Value } from "../values/Value";
import { None } from "./None";
import { Num } from "./Num";
import { Ref } from "./Ref";
import { Str } from "./Str";

export const num = (x: number) => Num.of(Value.of(x));
export const str = (x: string) => Str.of(Value.of(x));
export const ref = (x: any) => Ref.of(Value.of(x));
export const none = () => None.of();

export const isScalar = (x: any) => {
  return x instanceof Num || x instanceof Str || x instanceof Ref;
};
