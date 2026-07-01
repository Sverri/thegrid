import type { List } from "immutable";

export function extractPropertiesFromObjects(objects: List<object>): string[] {
    const bindings = new Set<string>();
    for (const obj of objects) {
        for (const key of Object.keys(obj)) {
            bindings.add(key);
        }
    }
    return [...bindings];
}
