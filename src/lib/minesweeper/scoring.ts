import type { Board, BoardConfig } from './types';

/**
 * Difficulty presets used for score calculation and display.
 *
 * The scoring formula itself is fully parametric and depends only on
 * board dimensions and mine count, but these presets are useful for
 * UI labeling and future per-difficulty tuning.
 */
export type Difficulty = 'beginner' | 'intermediate' | 'expert' | 'custom';

/**
 * Gameplay statistics collected at the moment the game ends.
 */
export interface GameStats {
  /** Number of left-clicks the player made during the game. */
  clickCount: number;
  /** Mines the player revealed (game-ending hits). */
  mineHits: number;
  /** Elapsed wall-clock time in seconds. */
  timeElapsed: number;
  /** Total mines on the board. */
  mineCount: number;
  /** Total number of tiles (`rows * cols`). */
  totalCells: number;
}

/**
 * Per-factor breakdown of a calculated score.
 */
export interface ScoreBreakdown {
  /** Base score: `(S - M) * B` */
  base: number;
  /** Difficulty factor: `1 + (M / S) * log2(S)` */
  difficulty: number;
  /** Time bonus: `K * e^(-λ * T)` */
  time: number;
  /** Efficiency bonus: `E * (S - M) / Clicks` */
  efficiency: number;
}

/**
 * Final score result returned by {@link calculateScore}.
 */
export interface ScoreResult {
  /** The player's final score. */
  score: number;
  /** Factor breakdown for UI display. */
  breakdown: ScoreBreakdown;
}

const B = 10;
const K = 5000;
const LAMBDA = 0.05;
const E = 2000;

/**
 * Maps a board configuration to a named difficulty tier.
 *
 * Uses exact dimension matching against the three classic presets;
 * anything else is treated as `custom`.
 *
 * @param config - The board configuration to classify
 * @returns The corresponding difficulty tier
 */
export function getDifficulty(config: BoardConfig): Difficulty {
  if (config.rows === 9 && config.cols === 9 && config.mineCount === 10) return 'beginner';
  if (config.rows === 16 && config.cols === 16 && config.mineCount === 40) return 'intermediate';
  if (config.rows === 16 && config.cols === 30 && config.mineCount === 99) return 'expert';
  return 'custom';
}

/**
 * Derives gameplay statistics from the final board state and click count.
 *
 * @param board - The final board state (after reveals and flagging)
 * @param timeElapsed - Total seconds elapsed since the game started
 * @param clickCount - Number of left-clicks performed by the player
 * @returns A populated {@link GameStats} object
 */
export function computeStats(board: Board, timeElapsed: number, clickCount: number): GameStats {
  let mineHits = 0;
  for (const row of board) {
    for (const tile of row) {
      if (tile.revealed && tile.isMine) mineHits++;
    }
  }
  return {
    clickCount,
    mineHits,
    timeElapsed,
    mineCount: board.flat().filter((t) => t.isMine).length,
    totalCells: board.length * board[0].length,
  };
}

/**
 * Calculates the final score from game statistics using the parametric formula.
 *
 * Formula:
 * ```
 * Score = (S-M)*B*(1 + (M/S)*log2(S)) + K*e^(-λT) + E*(S-M)/Clicks
 * ```
 *
 * Where:
 * - `S` = total cells, `M` = mine count, `T` = time in seconds, `Clicks` = left-click count
 * - `B = 10`, `K = 5000`, `λ = 0.05`, `E = 2000`
 *
 * The score is floored at 0 so it never goes negative.
 *
 * @param stats - Gameplay statistics derived from the final board
 * @param _difficulty - Difficulty tier (reserved for future per-difficulty tuning; currently unused in formula)
 * @returns A {@link ScoreResult} containing the final score and breakdown
 */
export function calculateScore(stats: GameStats, _difficulty: Difficulty): ScoreResult {
  const S = stats.totalCells;
  const M = stats.mineCount;
  const safeCells = S - M;
  const T = stats.timeElapsed;
  const clicks = Math.max(stats.clickCount, 1);

  const base = safeCells * B;
  const difficultyFactor = 1 + (M / S) * Math.log2(S);
  const timeBonus = K * Math.exp(-LAMBDA * T);
  const efficiencyBonus = E * (safeCells / clicks);

  const finalScore = Math.max(0, Math.floor(base * difficultyFactor + timeBonus + efficiencyBonus));

  return {
    score: finalScore,
    breakdown: {
      base: Math.floor(base),
      difficulty: Math.floor(difficultyFactor * 100) / 100,
      time: Math.floor(timeBonus),
      efficiency: Math.floor(efficiencyBonus),
    },
  };
}
