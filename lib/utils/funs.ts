import { ValueLike } from "../structs/values/ValueLike";
import { Key } from "./types";

// Higher order function utilities

export function identity<T>(x: T) {
  return x;
}

export function call(fn: (...args: any[]) => any) {
  return fn();
}

export function noop() {}

export function lazy<T>(x: T) {
  return () => x;
}

export function firstArgument<T>(x: T, _: any) {
  return x;
}

export function secondArgument<T>(_: any, y: T) {
  return y;
}

export function POJO() {
  return {};
}

export function inSequence(fn1: Function, fn2: Function) {
  return function () {
    fn1();
    fn2();
  };
}

export function unwrap(x: { value: () => any }) {
  return x.value();
}

// Simple unary functions

export function asString(x: any) {
  return x.toString();
}

export function asInt(x: string) {
  return parseInt(x, 10);
}

// Simple binary functions

export function diff(x: number, y: number) {
  return x - y;
}

export function sum(x: number, y: number) {
  return x + y;
}

export function compareAlNum(a: string, b: string) {
  return a.localeCompare(b, "en", { numeric: true });
}

// Number functions

export function threshold(
  value: number,
  increment: number,
  min: number,
  max: number
) {
  if (value + increment < min) return value;
  if (value + increment > max) return value;
  return value + increment;
}

// Array functions

export function seq(start: number, end: number) {
  const length = Math.abs(end - start) + 1;
  const sign = end >= start ? 1 : -1;
  return Array.from(Array(length), (_, i) => start + sign * i);
}

export function minMax(x: number[]) {
  let [min, max] = [Infinity, -Infinity];
  for (let i = 0; i < x.length; i++) {
    min = Math.min(min, x[i]);
    max = Math.max(max, x[i]);
  }
  return [min, max];
}

export function orderBy<T>(array: T[], orderArray: number[]) {
  const result = [...array];
  result.sort((a, b) => {
    return Math.sign(
      orderArray[result.indexOf(a)] - orderArray[result.indexOf(b)]
    );
  });

  return result;
}

// Object functions

export function allKeys<T extends Record<Key, any>>(x: T) {
  return Reflect.ownKeys(x) as (keyof T)[];
}

export function allValues<T extends Record<Key, any>>(x: T) {
  const result = [] as {
    [key in keyof T]: T[key];
  }[keyof T][];
  for (const k of allKeys(x)) result.push(x[k]);
  return result;
}

export function allEntries<T extends Record<Key, any>>(x: T) {
  const result = [] as {
    [key in keyof T]: [key, T[key]];
  }[keyof T][];
  for (const k of allKeys(x)) result.push([k, x[k]]);
  return result;
}

export function unwrapAll<T extends Record<Key, ValueLike<any>>>(x: T) {
  const result = {} as {
    [key in keyof T]: ReturnType<T[key]["value"]>;
  };
  for (const [k, v] of allEntries(x)) result[k] = v.value();
  return result;
}

// Other

export async function loadData(path: string) {
  const result = await fetch(path);
  return await result.json();
}

export function throttle(fun: Function, delay: number) {
  let lastTime = 0;
  return (...args: any[]) => {
    const now = new Date().getTime();
    if (now - lastTime < delay) return;
    lastTime = now;
    fun(...args);
  };
}

export function pointInRect(
  point: [number, number],
  rect: [number, number, number, number]
) {
  const [x, y] = point;
  const [x0, y0, x1, y1] = rect;

  if (!(x < x0 || x > x1 || y < y0 || y > y1)) return true;
  return false;
}

export function rectOverlap(
  rect1x: [number, number],
  rect1y: [number, number],
  rect2x: [number, number],
  rect2y: [number, number]
) {
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
}
