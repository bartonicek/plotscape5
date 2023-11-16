export const groupContexts = [1, 2, 3, 4, 5, 6, 7, 8] as const;
export const contexts = ["base", "user", "over", ...groupContexts] as const;

export type Context = (typeof contexts)[number];
export type Contexts = Record<Context, CanvasRenderingContext2D>;
