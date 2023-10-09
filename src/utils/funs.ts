import { ValueLike } from "../structs/Value";
import { Key } from "./types";

export const identity = <T>(x: T) => x;
export const noop = () => {};
export const lazy =
  <T>(x: T) =>
  () =>
    x;
export const firstArgument = <T>(x: T, _: any) => x;
export const secondArgument = <T>(_: any, y: T) => y;
export const POJO = () => ({});

export const toString = (x: any) => x.toString();
export const toInt = (x: string) => parseInt(x, 10);

export const seq = (start: number, end: number) => {
  return Array.from(Array(end - start + 1), (_, i) => start + i);
};

export const minMax = (x: number[]) => {
  let [min, max] = [Infinity, -Infinity];
  for (let i = 0; i < x.length; i++) {
    min = Math.min(min, x[i]);
    max = Math.max(max, x[i]);
  }
  return [min, max];
};

export const allKeys = <T extends Record<Key, any>>(x: T) => {
  return Reflect.ownKeys(x) as (keyof T)[];
};

export const allEntries = <T extends Record<Key, any>>(x: T) => {
  const result = [] as { [key in keyof T]: [key, T[key]] }[keyof T][];
  for (const k of allKeys(x)) result.push([k, x[k]]);
  return result;
};

export const unwrapAll = <T extends Record<Key, ValueLike<any>>>(x: T) => {
  const result = {} as { [key in keyof T]: ReturnType<T[key]["value"]> };
  for (const [k, v] of allEntries(x)) result[k] = v.value();
  return result;
};
