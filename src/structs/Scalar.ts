import { Value, ValueLike } from "./Value";
import {
  NumVariable,
  RefVariable,
  StrVariable,
  VariableLike,
} from "./Variable";

export type ScalarLike<T> = ValueLike<T> & {
  toVariable: () => VariableLike<T>;
};

export const num = (x: number) => Num.of(Value.of(x));
export const str = (x: string) => Str.of(Value.of(x));
export const ref = (x: any) => Ref.of(Value.of(x));
export const none = () => None.of();

export const isScalar = (x: any) => {
  return x instanceof Num || x instanceof Str || x instanceof Ref;
};

export class Num implements ScalarLike<number> {
  constructor(private valueLike: ValueLike<number>) {}

  static of = (valueLike: ValueLike<number>) => new Num(valueLike);

  value = () => this.valueLike.value();
  toVariable = () => NumVariable.from([this.value()]);

  inc = () => num(this.value() + 1);
  dec = () => num(this.value() - 1);

  add = (other: Num) => num(this.value() + other.value());
  minus = (other: Num) => num(this.value() - other.value());
  times = (other: Num) => num(this.value() * other.value());
  divideBy = (other: Num) => num(this.value() / other.value());
}

export class Str implements ScalarLike<string> {
  constructor(private valueLike: ValueLike<string>) {}

  static of = (valueLike: ValueLike<string>) => new Str(valueLike);

  value = () => this.valueLike.value();
  toVariable = () => StrVariable.from([this.value()]);
}

export class Ref implements ScalarLike<any> {
  constructor(private valueLike: ValueLike<any>) {}

  static of = (valueLike: ValueLike<any>) => new Ref(valueLike);

  value = () => this.valueLike.value();
  toVariable = () => RefVariable.from([this.value()]);
}

export class None implements ScalarLike<any> {
  constructor() {}

  static of = () => new None();

  value = () => undefined;
  toVariable = () => RefVariable.from([]);
}
