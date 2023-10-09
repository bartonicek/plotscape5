import { Value, ValueLike } from "./Value";

export type ScalarLike<T> = ValueLike<T>;

export const num = (x: number) => Num.of(Value.of(x));
export const str = (x: string) => Str.of(Value.of(x));
export const ref = (x: object) => Ref.of(Value.of(x));

export class Num implements ValueLike<number> {
  constructor(private valueLike: ValueLike<number>) {}

  static of = (valueLike: ValueLike<number>) => new Num(valueLike);
  value = () => this.valueLike.value();

  add = (other: Num) => num(this.value() + other.value());
  minus = (other: Num) => num(this.value() - other.value());
  divideBy = (other: Num) => num(this.value() / other.value());
}

export class Str implements ValueLike<string> {
  constructor(private valueLike: ValueLike<string>) {}

  static of = (valueLike: ValueLike<string>) => new Str(valueLike);
  value = () => this.valueLike.value();
}

export class Ref implements ValueLike<object> {
  constructor(private valueLike: ValueLike<object>) {}

  static of = (valueLike: ValueLike<object>) => new Ref(valueLike);
  value = () => this.valueLike.value();
}
