import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
    base: "/thegrid/",
    test: {
        include: ["src/**/*.test.ts"],
        environment: "node",
        environmentOptions: {
            happyDOM: {
                width: 1000,
                height: 1000,
            },
        },
        coverage: {
            provider: "v8",
        },
    },
    resolve: {
        alias: {
            "@structure": path.resolve(import.meta.dirname, "./src/structures"),
            "@helpers": path.resolve(import.meta.dirname, "./src/helpers"),
            "@extension": path.resolve(import.meta.dirname, "./src/extensions"),
            "@shared": path.resolve(import.meta.dirname, "./src/shared"),
            "@shard": path.resolve(import.meta.dirname, "./src/shards"),
            "@grid": path.resolve(import.meta.dirname, "./src/grid"),
        },
    },
});
