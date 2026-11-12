# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`thegrid` is a framework-free, virtualized data grid component written in TypeScript. The live showcase (the root `index.html` + `app.ts` demo) is deployed to GitHub Pages from `main` by `.github/workflows/deploy.yml`. Vite's `base` is `/thegrid/`, so dev URLs live under `http://localhost:5173/thegrid/`.

## Commands

- `npm run dev`: start the Vite dev server with the demo page
- `npm run build`: type-check (`tsc`) and run the production build. There is no separate lint step: the strict `tsconfig.json` does that job (`noUnusedLocals`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `noPropertyAccessFromIndexSignature`, `erasableSyntaxOnly`, and so on)
- `npm test`: run the Vitest unit tests (`src/**/*.test.ts`)
  - Single file: `npx vitest run src/structures/range.test.ts`
  - Single test: `npx vitest run src/grid/grid.test.ts -t "test name"`
  - Coverage: `npx vitest run --coverage`
- `npm run test:e2e`: run the Playwright tests (`**/*.spec.ts`, Chromium only). Install the browser first with `npx playwright install chromium`. Use `npm run test:e2e:ui` for UI mode. The reporter is set to `null`, so pass `--reporter=list` to see output.
- `npm run typecheck`: run `tsc` only
- `npm run format` / `npm run format:check`: run Prettier on `src`, `e2e`, the root HTML, CSS and config files (4-space indent, 120 columns, double quotes, trailing commas, `arrowParens: avoid`). CI runs `format:check` and `npm test` before building, so both must pass.

## Testing conventions

- Unit tests sit next to their source as `*.test.ts`. The default Vitest environment is `node`, so any test that touches the DOM must start with `/** @vitest-environment happy-dom */`.
- Playwright specs are `*.spec.ts` and can live anywhere (for example, `src/grid/grid.spec.ts`). They load `e2e/test.html`, a small fixture page driven by `e2e/test.ts`. They do not load the demo page.

## Architecture

The public entry point is `src/index.ts`. It exports `createGrid`, `createColumn`, the `DataType`, `CellType` and `Headers` enums, and the public types. Anything a consumer needs must be exported there. Modules are generally classes that are exported only as types and built through `createX()` factory functions. Value objects (`Point`, `Range`) are frozen plain objects with `isX()` guards that check `Object.isFrozen`.

Path aliases are defined in both `tsconfig.json` and `vite.config.ts`, so keep the two in sync: `@grid`, `@structure`, `@extension`, `@shared`, `@helpers`.

**Grid (`src/grid/grid.ts`)** is the central object. It owns:

- `data`: a `CollectionView<T>` over the source rows.
- `columns`: a `CollectionView<ColumnOptions<T>, Column<T>>` that maps options to `Column` instances and filters out hidden columns. Each options object maps to one cached `Column`. A change to a `Column` raises its `onChange`, which refreshes the view.
- `selection` (`src/grid/selection.ts`): a rectangular `Range` with an `onChange` event.
- A private `Renderer` (`src/grid/renderer.ts`).
- The DOM regions created by `setupDomElements` (`src/grid/setup.ts`): cells, column headers, row headers and the top-left corner.

**Invalidation flow:** a change to data, columns, `cellSize` or the header settings calls `grid.invalidate()`. That call is debounced (32 ms) and then raises `onInvalidate`. The renderer and the extensions subscribe to `onInvalidate`. A selection change skips the full re-render and calls `renderer.updateSelection()` which only updates selection classes and headers. Scroll renders and selection updates are batched to one per animation frame (`src/helpers/frame.ts`).

**CollectionView (`src/structures/collection.ts`)** keeps a copy of the source items and lazily rebuilds its filtered, sorted and mapped `items` when it is marked dirty. `onChange` fires on the clean-to-dirty transition. Setting `filter`, `sorter` or `source` marks it dirty. `refresh()` marks it dirty after an in-place mutation of the source items. `items` and `source` are frozen arrays that are returned without copying. `items` is replaced, never mutated, so array identity means "unchanged" (`columnFromLeft` caches offsets on that basis).

**Rendering is virtualized.** `calculateRenderArea` (`src/extensions/shared/`) turns the scroll position into a visible `Range`, plus a render-ahead buffer (1 column, 3 rows). On every render, each region is cleared and rebuilt from that range. Cells are absolutely positioned with CSS transforms, so they do not stretch the scroll area. `expanderExtension` sets the `--internal-expander-x`/`-y` CSS variables to the total content size, which makes the content scrollable. Every row has the same height (`cellSize`). Column x-offsets come from `columnFromLeft` (`src/structures/column.ts`).

**Extensions (`src/extensions/`)** are functions `(grid) => Disposer` that the Grid constructor calls. The returned disposer removes everything the extension set up, and `grid.destroy()` calls all of them. They add behavior by subscribing to grid events or DOM events: `expander`, `mouse` (selection by click and drag), `keyboard` (arrow, Ctrl and Shift navigation, select-all) and `resizeobserver`. Rendering helpers shared with the renderer live in `src/extensions/shared/`: `createCell`, `setCellContents` (formats each value by `DataType` using the grid's `Intl.Locale`) and `renderSelection`.

**Enums (`src/shared/enums.ts`)** are frozen `const` objects paired with union types. TypeScript `enum` is not used, because `erasableSyntaxOnly` forbids it.

**Styling:** `src/style.css` is the component stylesheet. It uses `.thegrid-*` classes, CSS custom properties and `light-dark()`, and Vite's Lightning CSS is configured to keep `light-dark()` as written. The root `style.css` styles only the demo and e2e pages.
