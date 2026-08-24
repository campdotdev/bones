import { defineConfig } from "vite-plus";
import { playwright } from "vite-plus/test/browser-playwright";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  pack: {
    entry: ["src/index.ts", "src/react/index.ts", "src/element/index.ts"],
    unbundle: true,
    copy: "src/css",
    dts: {
      tsgo: true,
    },
    exports: {
      customExports: {
        "./css": {
          style: "./src/css/bones.css",
          default: "./src/css/bones.css",
        },
        "./auto.css": {
          style: "./src/css/auto.css",
          default: "./src/css/auto.css",
        },
      },
    },
    deps: {
      neverBundle: ["react", "react-dom", /^react\//],
    },
  },
  test: {
    coverage: {
      provider: "v8",
      include: ["src/**"],
    },
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "jsdom",
          include: ["tests/*.test.{ts,tsx}"],
        },
      },
      {
        extends: true,
        test: {
          name: "browser",
          include: ["tests/browser/**/*.test.{ts,tsx}"],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
            expect: {
              // @ts-expect-error — vite-plus's vendored `ToMatchScreenshotComparators`
              // is never populated by `vite-plus/test/browser-playwright`'s ambient
              // `declare module "vitest/node"` augmentation, which targets the real
              // `vitest` package rather than vite-plus's internal copy, so this
              // (otherwise-valid) config object has no type to check against.
              toMatchScreenshot: {
                comparatorName: "pixelmatch",
                comparatorOptions: { allowedMismatchedPixelRatio: 0.01 },
                // Platform-suffixed baselines: CI (linux) baselines are
                // committed; local darwin ones are gitignored (Task 3).
                resolveScreenshotPath: ({
                  testFileDirectory,
                  screenshotDirectory,
                  testFileName,
                  arg,
                  browserName,
                  ext,
                }: {
                  testFileDirectory: string;
                  screenshotDirectory: string;
                  testFileName: string;
                  arg: string;
                  browserName: string;
                  ext: string;
                }) =>
                  `${testFileDirectory}/${screenshotDirectory}/${testFileName}/${arg}-${browserName}-${process.platform}${ext}`,
              },
            },
          },
        },
      },
    ],
  },
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {},
});
