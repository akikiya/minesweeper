export type GameState = 'playing' | 'won' | 'lost';

export type Tile = {
  isMine: boolean;
  adjacentMines: number;
  revealed: boolean;
  flagged: boolean;
};
export type Board = Tile[][];

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

function countAdjacentMines(board: Board, row: number, col: number) {
  let count = 0;
  for (const [dr, dc] of DIRS) {
    const nr = row + dr;
    const nc = col + dc;
    if (board[nr]?.[nc]?.isMine) count++;
  }
  return count;
}

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

export function toggleFlag(board: Board, row: number, col: number): void {
  const tile = board[row][col];
  if (tile.revealed) return;
  tile.flagged = !tile.flagged;
}

export function checkWin(board: Board): boolean {
  return board.every((row) =>
    row.every((tile) => tile.isMine || tile.revealed),
  );
}

export function revealAllMines(board: Board): void {
  for (const row of board) {
    for (const tile of row) {
      if (tile.isMine) {
        tile.revealed = true;
      }
    }
  }
}

export function getRemainingMines(board: Board): number {
  const totalMines = board.flat().filter((t) => t.isMine).length;
  const flags = board.flat().filter((t) => t.flagged).length;
  return totalMines - flags;
}