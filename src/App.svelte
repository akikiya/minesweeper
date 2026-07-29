<script lang="ts">
    /**
     * Root Svelte component for the Minesweeper game.
     *
     * Manages the top-level game state: the board, current
     * `GameState`, and the derived remaining-mine count.
     * Delegates tile-reveal and flag actions to the logic
     * layer in `src/lib/minesweeper.ts` and provides a
     * `reset` callback for starting a new game.
     */
    import Board from "./components/Board.svelte";
    import { createEmptyBoard, type GameState, revealTile, toggleFlag, revealAllMines, getRemainingMines } from "./lib/minesweeper";

    const rows = 9;
    const cols = 9;
    const mineCount = 10;
    let board = $state(createEmptyBoard(rows, cols));
    let gameState = $state<GameState>('playing');
    const remainingMines = $derived(getRemainingMines(board));

    /**
     * Handles a tile-reveal action from the Board.
     *
     * Delegates to `revealTile` and then checks the returned
     * state: if the player lost or won, all mines are revealed
     * on the board so the final state is visible, and the
     * component-level `gameState` is updated accordingly.
     *
     * @param r - Row index of the clicked tile
     * @param c - Column index of the clicked tile
     * @returns The resulting game state after the reveal
     */
    function handleReveal(r: number, c: number): GameState {
        const state = revealTile(board, r, c);
        if (state === 'lost') {
            gameState = 'lost';
            revealAllMines(board);
        } else if (state === 'won') {
            gameState = 'won';
            revealAllMines(board);
        }
        return state;
    }

    /**
     * Handles a flag-toggle action from the Board.
     *
     * Delegates directly to `toggleFlag` in the minesweeper
     * logic layer. No game-state update is needed here because
     * flagging does not end the game.
     *
     * @param r - Row index of the right-clicked tile
     * @param c - Column index of the right-clicked tile
     */
    function handleFlag(r: number, c: number) {
        toggleFlag(board, r, c);
    }

    /**
     * Resets the game to a fresh state with an empty board.
     *
     * Called by the "New Game" button. Replaces the current
     * board with a blank one and sets `gameState` back to
     * `'playing'`.
     */
    function reset() {
        board = createEmptyBoard(rows, cols);
        gameState = 'playing';
    }
</script>

<div id="game">
    <div id="status">
        <span id="mines">{remainingMines}</span>
        <button onclick={reset}>New Game</button>
        {#if gameState === 'won'}
            <span id="result" data-state="won">You Win!</span>
        {:else if gameState === 'lost'}
            <span id="result" data-state="lost">Game Over</span>
        {/if}
    </div>
    <Board
        {board}
        {mineCount}
        {gameState}
        onReveal={handleReveal}
        onFlag={handleFlag}
    />
</div>