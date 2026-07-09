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
            "@": path.resolve(__dirname, "./src"),
        },
    },
});
