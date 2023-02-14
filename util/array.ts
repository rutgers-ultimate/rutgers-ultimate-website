export function distinctEntries<T>(array?: T[], keyFn?: (val: T) => any): T[] {
  if (!array) {
    return [];
  }
  if (!keyFn) {
    return Array.from(new Set(array));
  }
  return Object.values(
    Object.fromEntries(array.map((item) => [keyFn(item), item]))
  );
}

export function extractKey<T>(
  array: T[] | undefined | null,
  key: keyof T
): { [id: string]: T } {
  return Object.fromEntries(array?.map((obj) => [obj[key], obj]) ?? []);
}

export function insert<T>(arr: T[] | undefined | null, obj: T, i: number): T[] {
  if (!arr?.length) return [obj];
  return [...arr.slice(0, i), obj, ...arr.slice(i + 1)];
}

export function remove<T>(arr: T[] | undefined | null, i: number): T[] {
  if (!arr?.length) return [];
  if (arr.length <= i) return arr;
  return [...arr.slice(0, i), ...arr.slice(i + 1)];
}
