export function extractPropertiesFromObjects(objects: object[]): string[] {
    const bindings = new Set<string>();
    for (const obj of objects) {
        for (const key of Object.keys(obj)) {
            bindings.add(key);
        }
    }
    return [...bindings];
}
