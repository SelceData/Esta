/**
 * @param count The count of elements.
 * @param cx The center position coordinate.
 * @param cy The center position coordinate.
 * @param distance The minimal distance between elements.
 * @returns Coordinates of the elements.
 */
export function Allocate(count: number, cx: number, cy: number, distance: number): [number, number][] {
  if (count == 1) return [[cx, cy]];
  else if (count <= 1) throw new TypeError(`Invalid allocate count: ${count}`);
  else return new Array(count).fill(count)
    .map((count, index) => {
      const angle = Math.PI * 2 / count * (index + 1);
      const dist = distance;
      return [cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist];
    });
}