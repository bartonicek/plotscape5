import { Num } from "../structs/scalars/Num";
import { Ref } from "../structs/scalars/Ref";
import { ScalarLike } from "../structs/scalars/ScalarLike";
import { Str } from "../structs/scalars/Str";
import { NumVariable } from "../structs/variables/NumVariable";
import { RefVariable } from "../structs/variables/RefVariable";
import { StrVariable } from "../structs/variables/StrVariable";
import { VariableLike } from "../structs/variables/VariableLike";

export type Callback = (...args: any) => any;
export type SideEffect = (...args: any) => void;

export type MapFn<T, U> = (next: T) => U;
export type ReduceFn<T, U> = (prev: U, next: T) => U;

export type Lazy<T> = () => T;
export type Stringable = { toString(): string };

export type Key = string | number | symbol;
export type Dict = Record<Key, any>;

export type KeysOfType<T extends Dict, U> = keyof {
  [key in keyof T as T[key] extends U ? key : never]: U;
};

export type Cols = Record<Key, VariableLike<any>>;
export type Row = Record<Key, ScalarLike<any>>;

export type ScalarOf<T extends VariableLike<any>> = T extends VariableLike<
  infer U
>
  ? U extends number
    ? Num
    : U extends string
    ? Str
    : U extends object
    ? Ref
    : never
  : never;

export type VariableOf<T extends ScalarLike<any>> = T extends ScalarLike<
  infer U
>
  ? U extends number
    ? NumVariable
    : U extends string
    ? StrVariable
    : U extends object
    ? RefVariable
    : never
  : never;

export type RowOf<T extends Cols> = { [key in keyof T]: ScalarOf<T[key]> };
export type ColsOf<T extends Row> = { [key in keyof T]: VariableOf<T[key]> };
