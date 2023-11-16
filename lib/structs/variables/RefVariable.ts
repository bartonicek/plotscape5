import { Lazy } from "../../utils/types";
import { Ref } from "../scalars/Ref";
import { View } from "../values/View";
import { VariableLike } from "./VariableLike";

export class RefVariable implements VariableLike<any> {
  name: string | undefined;
  meta: undefined;

  constructor(private array: any[], options?: { name?: string }) {
    this.name = options?.name;
  }

  static from = (array: any[]) => new RefVariable(array);

  empty() {
    this.array.length = 0;
  }

  values() {
    return this.array;
  }

  ith(indexfn: Lazy<number>) {
    return Ref.of(View.of(this.array, indexfn));
  }

  push(ref: Ref) {
    return this.array.push(ref.value());
  }

  isOfLength(n: number) {
    return this.array.length === n;
  }
}
