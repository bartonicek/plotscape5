import { Value, ValueLike } from "./Value";
import {
  NumVariable,
  RefVariable,
  StrVariable,
  VariableLike,
} from "./Variable";

export type ScalarLike<T> = ValueLike<T> & {
  toVariable(): VariableLike<T>;
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

  static of(valueLike: ValueLike<number>) {
    return new Num(valueLike);
  }

  value() {
    return this.valueLike.value();
  }

  toVariable() {
    return NumVariable.from([this.value()]);
  }

  inc() {
    return num(this.value() + 1);
  }

  dec() {
    return num(this.value() - 1);
  }

  add(other: Num) {
    return num(this.value() + other.value());
  }

  minus(other: Num) {
    return num(this.value() - other.value());
  }

  times(other: Num) {
    return num(this.value() * other.value());
  }

  divideBy(other: Num) {
    return num(this.value() / other.value());
  }
}

export class Str implements ScalarLike<string> {
  constructor(private valueLike: ValueLike<string>) {}

  static of(valueLike: ValueLike<string>) {
    return new Str(valueLike);
  }

  value() {
    return this.valueLike.value();
  }

  toVariable() {
    return StrVariable.from([this.value()]);
  }
}

export class Ref implements ScalarLike<any> {
  constructor(private valueLike: ValueLike<any>) {}

  static of(valueLike: ValueLike<any>) {
    return new Ref(valueLike);
  }

  value() {
    return this.valueLike.value();
  }

  toVariable() {
    return RefVariable.from([this.value()]);
  }
}

export class None implements ScalarLike<any> {
  constructor() {}

  static of() {
    return new None();
  }

  value() {
    return undefined;
  }

  toVariable() {
    return RefVariable.from([]);
  }
}
