/**
 * Represents the three possible states of a Minesweeper game.
 * - `'playing'` — the game is active and awaiting player input
 * - `'won'` — all non-mine tiles have been revealed
 * - `'lost'` — a mine tile was revealed
 */
export type GameState = 'playing' | 'won' | 'lost';

/**
 * A single tile on the Minesweeper board.
 *
 * @property isMine — whether this tile hides a mine
 * @property adjacentMines — count of mines in the 8 surrounding cells (0–8)
 * @property revealed — whether the tile has been uncovered by the player
 * @property flagged — whether the player has marked this tile with a flag
 */
export type Tile = {
  isMine: boolean;
  adjacentMines: number;
  revealed: boolean;
  flagged: boolean;
};

/**
 * A two-dimensional grid of tiles, indexed as `board[row][col]`.
 */
export type Board = Tile[][];

/**
 * Configuration for a Minesweeper board.
 *
 * @property rows - Number of rows in the board
 * @property cols - Number of columns in the board
 * @property mineCount - Number of mines to place
 */
export type BoardConfig = {
  rows: number;
  cols: number;
  mineCount: number;
};
