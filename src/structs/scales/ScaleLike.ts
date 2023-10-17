import { ExpanseDiscrete } from "./ExpanseDiscrete";
import { ExpanseLike } from "./ExpanseLike";
import { ExpanseLinear } from "./ExpanseLinear";

export type ScaleLike = {
  pushforward(x: any): number;
  pullback(x: number): any;
  breaks(): any[];
  breakWidth(): number;

  setLimits?(domain: ExpanseLinear): ScaleLike;
  setValues?(domain: ExpanseDiscrete): ScaleLike;
  setDomain?(domain: ExpanseLike<any>): ScaleLike;
  setNorm(norm: ExpanseLinear): ScaleLike;
  setCodomain(codomain: ExpanseLinear): ScaleLike;
};
