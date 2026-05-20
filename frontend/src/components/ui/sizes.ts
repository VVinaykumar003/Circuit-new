export const fieldSizeClasses = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-4 text-base",
} as const;

export type FieldSize = keyof typeof fieldSizeClasses;
