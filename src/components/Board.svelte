<script lang="ts">
    /**
     * Board component that renders the grid of tiles and
     * manages first-click initialization and right-click
     * flagging.
     *
     * The board is initialized on the player's first click
     * (safe-first-click pattern), ensuring the clicked cell
     * and its immediate neighborhood are guaranteed to be
     * mine-free at the start of the game.
     */
    import { initializeBoard } from "../lib/minesweeper/board";
    import type { Board, GameState } from "../lib/minesweeper/types";
    import Tile from "./Tile.svelte";

    interface Props {
        /** The 2D tile grid to render */
        board: Board;
        /** Total number of mines on the board */
        mineCount: number;
        /** Current game state, used to guard input */
        gameState: GameState;
        /** Callback invoked when a tile is left-clicked */
        onReveal: (r: number, c: number) => GameState;
        /** Callback invoked when a tile is right-clicked */
        onFlag: (r: number, c: number) => void;
    }
    const { board, mineCount, gameState, onReveal, onFlag }: Props = $props();
    let initialized = $state(false);

    /**
     * Resets the `initialized` flag whenever the board reference
     * changes (e.g., on game reset), so that the next click
     * triggers fresh mine placement.
     */
    $effect(() => {
        board;
        initialized = false;
    });

    /**
     * Handles a left-click on a tile.
     *
     * On the first click, calls `initializeBoard` to place
     * mines (excluding the clicked cell so the first click
     * is always safe). Subsequent clicks go straight to
     * the reveal callback.
     *
     * @param r - Row index of the clicked tile
     * @param c - Column index of the clicked tile
     */
    function handleClick(r: number, c: number) {
        if (!initialized) {
            initializeBoard(board, mineCount, r, c);
            initialized = true;
        }
        onReveal(r, c);
    }

    /**
     * Handles a right-click on a tile for flag toggling.
     *
     * The handler is gated by the game state: flags can only
     * be toggled while the game is `'playing'`.
     *
     * @param r - Row index of the right-clicked tile
     * @param c - Column index of the right-clicked tile
     */
    function handleRightClick(r: number, c: number) {
        if (gameState !== 'playing') return;
        onFlag(r, c);
    }
</script>

<section id="board" style="--cols: {board.length > 0 ? board[0].length : 9}">
    {#each board as row, r}
        {#each row as tile, c}
            <Tile
                {tile}
                {gameState}
                onclick={() => handleClick(r, c)}
                onflag={() => handleRightClick(r, c)}
            />
        {/each}
    {/each}
</section>

<style>
    #board {
        display: grid;
        grid-template-columns: repeat(var(--cols), 1fr);
        gap: 2px;
        background: var(--border);
        border-radius: 10px;
        padding: 3px;
        box-shadow:
            0 1px 3px rgba(0, 0, 0, 0.06),
            0 4px 12px rgba(0, 0, 0, 0.04);
    }
</style>