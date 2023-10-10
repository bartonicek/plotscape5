import { ValueLike } from "../structs/Value";
import { Key } from "./types";

export const identity = <T>(x: T) => x;
export const call = (fn: (...args: any[]) => any) => fn();
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

export const diff = (x: number, y: number) => x - y;
export const sum = (x: number, y: number) => x + y;

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

export const allValues = <T extends Record<Key, any>>(x: T) => {
  const result = [] as { [key in keyof T]: T[key] }[keyof T][];
  for (const k of allKeys(x)) result.push(x[k]);
  return result;
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

export const loadData = async (path: string) => {
  const result = await fetch(path);
  return await result.json();
};

export const throttle = (fun: Function, delay: number) => {
  let lastTime = 0;
  return (...args: any[]) => {
    const now = new Date().getTime();
    if (now - lastTime < delay) return;
    lastTime = now;
    fun(...args);
  };
};

export const rectOverlap = (
  rect1x: [number, number],
  rect1y: [number, number],
  rect2x: [number, number],
  rect2y: [number, number]
) => {
  const [r1xmin, r1xmax] = minMax(rect1x);
  const [r1ymin, r1ymax] = minMax(rect1y);
  const [r2xmin, r2xmax] = minMax(rect2x);
  const [r2ymin, r2ymax] = minMax(rect2y);

  return !(
    r1xmax < r2xmin || // If any holds, rectangles don't overlap
    r1xmin > r2xmax ||
    r1ymax < r2ymin ||
    r1ymin > r2ymax
  );
};
