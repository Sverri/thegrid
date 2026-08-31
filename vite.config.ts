import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
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
            "@structure": path.resolve(__dirname, "./src/structures"),
            "@helpers": path.resolve(__dirname, "./src/helpers"),
            "@extension": path.resolve(__dirname, "./src/extensions"),
            "@shared": path.resolve(__dirname, "./src/shared"),
            "@shard": path.resolve(__dirname, "./src/shards"),
        },
    },
});
