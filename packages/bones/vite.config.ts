import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  pack: {
    entry: ["src/index.ts", "src/react/index.ts"],
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
    environment: "jsdom",
    coverage: {
      provider: "v8",
      include: ["src/**"],
    },
  },
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {},
});
