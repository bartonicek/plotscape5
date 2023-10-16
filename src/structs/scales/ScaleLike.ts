import { ValueLike } from "../values/ValueLike";

export type ScaleLike = {
  pushforward(x: any): number;
  pullback(x: number): any;
  breaks(): any[];
  breakWidth(): number;

  setDomain?(lower: any, upper: any): ScaleLike;
  setNorm(lower: any, upper: any): ScaleLike;
  setCodomain(lower: any, upper: any): ScaleLike;
  setValues?(values: ValueLike<string[]>): ScaleLike;
};
