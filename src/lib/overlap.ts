/** Half-open interval overlap: [start, start+duration). */
export function slotsOverlap(
  startA: number,
  durationA: number,
  startB: number,
  durationB: number
): boolean {
  return startA < startB + durationB && startB < startA + durationA;
}
