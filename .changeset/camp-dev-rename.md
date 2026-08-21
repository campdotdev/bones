---
"@camp-dev/bones": minor
---

Rename `@lovo/bones` to `@camp-dev/bones` and split it into subpath exports: the framework-agnostic core at the package root (`boneAttributes`, `minMax`, `resolveLength`), the React API at `@camp-dev/bones/react`, and the stylesheet at `@camp-dev/bones/css`. Update imports: `@lovo/bones` → `@camp-dev/bones/react`, `@lovo/bones/css` → `@camp-dev/bones/css`. `react` and `react-dom` are now optional peer dependencies.
