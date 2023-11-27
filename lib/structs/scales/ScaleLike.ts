import { ExpanseDiscrete } from "../expanses/ExpanseDiscrete";
import { ExpanseLike } from "../expanses/ExpanseLike";
import { ExpanseLinear } from "../expanses/ExpanseLinear";

export type ScaleLike = {
  pushforward(x: any): number;
  pullback(x: number): any;
  breaks(): any[];
  breakWidth(): number;
  resetUnit?(): void;

  setLimits?(domain: ExpanseLinear): ScaleLike;
  setValues?(domain: ExpanseDiscrete): ScaleLike;
  setDomain?(domain: ExpanseLike<any>): ScaleLike;
  setNorm(norm: ExpanseLinear): ScaleLike;
  setCodomain(codomain: ExpanseLinear): ScaleLike;
};
