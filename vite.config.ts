import path from "path";
import { defineConfig } from "vitest/config";
import { Features } from "lightningcss";

export default defineConfig({
    base: "/thegrid/",
    css: {
        lightningcss: { exclude: Features.LightDark },
    },
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
            "@core": path.resolve(import.meta.dirname, "./src/core"),
            "@shared": path.resolve(import.meta.dirname, "./src/shared"),
            "@grid": path.resolve(import.meta.dirname, "./src/grid"),
            "@render": path.resolve(import.meta.dirname, "./src/render"),
            "@extensions": path.resolve(import.meta.dirname, "./src/extensions"),
        },
    },
});
