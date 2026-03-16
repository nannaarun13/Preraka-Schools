
export const safeArray = <T>(value: T[] | undefined | null): T[] => {
  if (!Array.isArray(value)) return [];
  return value;
};
