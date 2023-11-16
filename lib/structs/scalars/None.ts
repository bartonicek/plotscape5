import { RefVariable } from "../variables/RefVariable";
import { ScalarLike } from "./ScalarLike";

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
