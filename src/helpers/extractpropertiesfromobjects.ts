import type { List } from "immutable";

/**
 * Extracts all property names present across a list of objects.
 *
 * The result is unique and ordered by first encounter, making it suitable for
 * deriving available bindings or column keys from the source data.
 *
 * @param objects The objects whose property names should be collected.
 * @returns A unique array of property names found in the input objects.
 */
export function extractPropertiesFromObjects(objects: List<object>): string[] {
    const bindings = new Set<string>();
    for (const obj of objects) {
        for (const key of Object.keys(obj)) {
            bindings.add(key);
        }
    }
    return [...bindings];
}
