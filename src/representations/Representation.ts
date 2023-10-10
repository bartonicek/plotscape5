export type Representation = {
  draw: () => void;
  checkSelection: (
    selectionRect: [number, number, number, number]
  ) => Set<number>;
};
