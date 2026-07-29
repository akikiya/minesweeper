# Minesweeper

A browser-based Minesweeper game built with Svelte 5, TypeScript, and Vite. Classic 9×9 beginner gameplay with a safe first click, flagging, and responsive styling.

## Features

- **9×9 board** with 10 mines — classic beginner difficulty
- **Safe first click** — mines are placed after your first reveal so you never start on a mine
- **Cascade reveal** — empty tiles automatically expand to show adjacent safe cells
- **Flagging** — right-click (or long-press) tiles to mark suspected mines
- **Win / lose detection** — game ends when you hit a mine or clear all safe tiles
- **Remaining mine counter** — tracks flags placed versus total mines
- **Responsive design** — adapts to mobile and desktop viewports
- **Light / dark mode** — respects system color-scheme preference
- **Accessibility** — keyboard navigation, focus indicators, and reduced-motion support

## Tech Stack

| Tool | Version |
|------|---------|
| [Svelte](https://svelte.dev/) | 5.x |
| [TypeScript](https://www.typescriptlang.org/) | ~6.0 |
| [Vite](https://vitejs.dev/) | 8.x |
| [pnpm](https://pnpm.io/) | (recommended) |

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm (or npm / yarn)

### Install

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

Opens the app at `http://localhost:5173`.

### Build

```bash
pnpm build
```

Outputs production assets to the `dist/` directory.

### Preview

```bash
pnpm preview
```

Serves the built app locally for testing.

### Type Check

```bash
pnpm check
```

Runs `svelte-check` and `tsc` to validate types across the project.

## How to Play

1. **Left-click** a tile to reveal it.
2. If the tile is a mine, the game ends.
3. If the tile has no adjacent mines, the board cascades and reveals surrounding empty tiles automatically.
4. **Right-click** a tile to place or remove a flag.
5. Clear all non-mine tiles to win.
6. Click **New Game** to reset the board at any time.

## Project Structure

```
src/
├── App.svelte            # Root component — manages game state and board reset
├── main.ts               # Application entry point
├── app.css               # Global styles and game-specific CSS
├── lib/
│   └── minesweeper.ts    # Pure game logic (board creation, mine placement, reveal, flagging)
└── components/
    ├── Board.svelte      # Board grid — handles click initialization and delegates events
    └── Tile.svelte       # Individual tile — renders revealed / flagged / mine states
```

## License

MIT
