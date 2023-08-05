export function Choice<T>(array: T[]): T | undefined {
  if (array.length > 0) array[Math.random() * array.length | 0];
  else return undefined;
}

export function Shuffle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function Dice(size = 6) {
  return Math.random() * size | 1;
}