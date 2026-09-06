import os from "node:os";
import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    testDir: ".",
    testMatch: "**/*.spec.ts",
    fullyParallel: true,
    forbidOnly: !!process.env["CI"],
    retries: process.env["CI"] ? 2 : 0,
    reporter: "null",
    outputDir: path.join(os.tmpdir(), "thegrid-playwright-results"),
    use: {
        baseURL: "http://127.0.0.1:5173/thegrid/",
        trace: "off",
        screenshot: "off",
        video: "off",
    },
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
    ],
    webServer: {
        command: "npm.cmd run dev -- --host 127.0.0.1",
        url: "http://127.0.0.1:5173/thegrid/",
        reuseExistingServer: !process.env["CI"],
    },
});
