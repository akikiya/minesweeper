import type { Board, GameState, Tile } from './types';

/** Offsets for the 8 neighboring cells (row-delta, col-delta). */
const DIRS = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

/**
 * Counts how many of the 8 neighboring cells contain a mine.
 *
 * Uses optional chaining (`board[nr]?.[nc]?.isMine`) so that out-of-bounds
 * neighbors (edge and corner tiles) are silently skipped rather than
 * throwing an index error.
 *
 * @param board - The board to inspect
 * @param row - The tile's row index
 * @param col - The tile's column index
 * @returns The number of adjacent mines (0–8)
 */
function countAdjacentMines(board: Board, row: number, col: number) {
  let count = 0;
  for (const [dr, dc] of DIRS) {
    const nr = row + dr;
    const nc = col + dc;
    if (board[nr]?.[nc]?.isMine) count++;
  }
  return count;
}

/**
 * Creates a blank board filled with unrevealed, unflagged, mine-free tiles.
 *
 * Used as the starting point before mine placement. The returned board
 * has all tiles with `isMine: false`, `adjacentMines: 0`, `revealed: false`,
 * and `flagged: false`.
 *
 * @param rows - Number of rows in the board
 * @param cols - Number of columns in the board
 * @returns A freshly allocated board with no mines placed
 */
export function createEmptyBoard(rows: number, cols: number): Board {
  return Array.from({ length: rows }, () =>
    Array.from(
      { length: cols },
      () =>
        ({
          isMine: false,
          adjacentMines: 0,
          revealed: false,
          flagged: false,
        }) satisfies Tile,
    ),
  );
}

/**
 * Places mines on the board and computes adjacent-mine counts for every tile.
 *
 * Mines are placed randomly (rejection sampling) while never placing a mine
 * on the cell at `(excludeRow, excludeCol)`. This guarantees the player's
 * first click is always safe — a standard Minesweeper convention.
 *
 * After placement, each non-mine tile's `adjacentMines` is computed by
 * counting mines in all 8 neighbor directions.
 *
 * Mutates the board in-place and returns the same reference.
 *
 * @param board - The board to initialize (must already have the correct dimensions)
 * @param mineCount - Number of mines to place
 * @param excludeRow - Row of the cell guaranteed to be mine-free (first click)
 * @param excludeCol - Column of the cell guaranteed to be mine-free (first click)
 * @returns The same board with mines placed and adjacency counts filled in
 */
export function initializeBoard(
  board: Board,
  mineCount: number,
  excludeRow: number,
  excludeCol: number,
): Board {
  const rows = board.length;
  const cols = board[0].length;

  let placed = 0;
  while (placed < mineCount) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);

    if (board[r][c].isMine || (r === excludeRow && c === excludeCol)) continue;

    board[r][c].isMine = true;
    placed++;
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].isMine) continue;
      board[r][c].adjacentMines = countAdjacentMines(board, r, c);
    }
  }

  return board;
}

/**
 * Reveals a tile and recursively reveals neighbor tiles when the
 * revealed tile has zero adjacent mines (BFS flood-fill).
 *
 * This implements the classic Minesweeper "chord" behavior: clicking
 * an empty (zero-adjacent) tile automatically uncovers all connected
 * empty tiles and their numbered borders in a breadth-first manner.
 *
 * Edge cases:
 * - Tiles that are already revealed or flagged are skipped (no-op).
 * - If a mine is revealed, the game state is `'lost'`.
 * - After any successful reveal, win-condition is checked; if all
 *   non-mine tiles are exposed, the state becomes `'won'`.
 *
 * @param board - The board to operate on (mutated in-place)
 * @param row - Row index of the tile to reveal
 * @param col - Column index of the tile to reveal
 * @returns The resulting game state after the reveal
 */
export function revealTile(board: Board, row: number, col: number): GameState {
  const tile = board[row][col];
  if (tile.revealed || tile.flagged) return 'playing';

  tile.revealed = true;

  if (tile.isMine) {
    return 'lost';
  }

  if (tile.adjacentMines === 0) {
    const queue: [number, number][] = [[row, col]];
    while (queue.length > 0) {
      const [r, c] = queue.shift()!;
      for (const [dr, dc] of DIRS) {
        const nr = r + dr;
        const nc = c + dc;
        const neighbor = board[nr]?.[nc];
        if (!neighbor || neighbor.revealed || neighbor.isMine || neighbor.flagged) continue;
        neighbor.revealed = true;
        if (neighbor.adjacentMines === 0) {
          queue.push([nr, nc]);
        }
      }
    }
  }

  return checkWin(board) ? 'won' : 'playing';
}

/**
 * Toggles a flag on a tile for the player to mark a suspected mine.
 *
 * Flagging a revealed tile has no effect. This is a lightweight
 * operation that does not modify adjacency counts or other tiles.
 *
 * @param board - The board containing the tile
 * @param row - Row index of the tile to flag
 * @param col - Column index of the tile to flag
 */
export function toggleFlag(board: Board, row: number, col: number): void {
  const tile = board[row][col];
  if (tile.revealed) return;
  tile.flagged = !tile.flagged;
}

/**
 * Checks whether the player has won the game.
 *
 * The win condition is met when every non-mine tile on the board
 * has been revealed. Flagged tiles do not count toward winning —
 * the player must uncover all safe tiles, not just flag mines.
 *
 * @param board - The board to evaluate
 * @returns `true` if all non-mine tiles are revealed
 */
export function checkWin(board: Board): boolean {
  return board.every((row) =>
    row.every((tile) => tile.isMine || tile.revealed),
  );
}

/**
 * Reveals every mine on the board, used to display the final state
 * after a game over (loss or win).
 *
 * Called by the UI layer after `revealTile` returns `'lost'` or
 * `'won'` so that all mines are visible to the player in the
 * end-game view.
 *
 * @param board - The board whose mines should be exposed
 */
export function revealAllMines(board: Board): void {
  for (const row of board) {
    for (const tile of row) {
      if (tile.isMine) {
        tile.revealed = true;
      }
    }
  }
}

/**
 * Computes how many mines remain to be flagged by the player.
 *
 * This is the total mine count minus the number of tiles currently
 * flagged. The result is used by the UI mine counter display.
 *
 * @param board - The board to count mines and flags on
 * @returns The number of mines not yet flagged (may be negative if
 *   the player has flagged more tiles than exist mines)
 */
export function getRemainingMines(board: Board): number {
  const totalMines = board.flat().filter((t) => t.isMine).length;
  const flags = board.flat().filter((t) => t.flagged).length;
  return totalMines - flags;
}
