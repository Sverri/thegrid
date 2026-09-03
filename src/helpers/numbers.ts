/**
 * Restricts a number to an inclusive range.
 *
 * @param min The smallest value that can be returned.
 * @param value The value to clamp.
 * @param max The largest value that can be returned. Must be greater than or equal to `min`.
 * @returns `min` when value is below the range, `max` when it is above the range, otherwise value.
 */
export function clampNumber(min: number, value: number, max: number) {
    return Math.max(min, Math.min(max, value));
}
