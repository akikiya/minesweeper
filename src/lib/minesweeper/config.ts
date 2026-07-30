import type { BoardConfig } from './types';

/**
 * Maximum allowed board dimension (rows or columns).
 */
export const MAX_DIM = 30;

/**
 * Minimum allowed board dimension (rows or columns).
 */
export const MIN_DIM = 1;

/**
 * Validates a Minesweeper board configuration.
 *
 * Checks that rows and cols are positive integers within
 * {@link MIN_DIM}–{@link MAX_DIM}, and that mineCount is a
 * non-negative integer that does not exceed `rows * cols - 1`
 * (at least one safe tile must exist for the first click).
 *
 * @param config - The board configuration to validate
 * @returns `{ valid: true }` if the config is valid, or
 *   `{ valid: false, errors: string[] }` with a list of
 *   human-readable error messages otherwise
 */
export function validateBoardConfig(config: BoardConfig): { valid: true } | { valid: false; errors: string[] } {
  const errors: string[] = [];

  if (!Number.isInteger(config.rows) || config.rows < MIN_DIM || config.rows > MAX_DIM) {
    errors.push(`rows must be an integer between ${MIN_DIM} and ${MAX_DIM}`);
  }

  if (!Number.isInteger(config.cols) || config.cols < MIN_DIM || config.cols > MAX_DIM) {
    errors.push(`cols must be an integer between ${MIN_DIM} and ${MAX_DIM}`);
  }

  if (errors.length === 0) {
    const totalTiles = config.rows * config.cols;
    if (!Number.isInteger(config.mineCount) || config.mineCount < 0) {
      errors.push('mineCount must be a non-negative integer');
    } else if (config.mineCount >= totalTiles) {
      errors.push(`mineCount must be less than the total number of tiles (${totalTiles})`);
    }
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}
