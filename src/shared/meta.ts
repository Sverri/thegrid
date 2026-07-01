import type { TheGrid } from "@/thegrid";

export const gridReferences = new Set<WeakRef<TheGrid<Record<string, any>>>>();
