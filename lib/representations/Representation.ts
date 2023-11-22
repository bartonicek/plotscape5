import { SideEffect } from "../utils/types";

export type Representation = {
  draw: () => void;
  checkSelection: (
    selectionRect: [number, number, number, number]
  ) => Set<number>;
  queryAt: (x: number, y: number) => Record<string, any> | undefined;
  keyActions?: Record<string, SideEffect>;
};
