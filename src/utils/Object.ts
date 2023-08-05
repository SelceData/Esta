type ObjectWithKeys = { [key: string]: unknown }

export function isObject(item: unknown): item is ObjectWithKeys {
  return !!item && typeof item === "object" && !Array.isArray(item);
}

export function mergeDeep<T extends ObjectWithKeys>(target: T, ...sources: T[]): T {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!isObject(target[key])) (target[key] as ObjectWithKeys) = {};
        mergeDeep(target[key] as ObjectWithKeys, source[key] as ObjectWithKeys);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
}