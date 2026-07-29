<script lang="ts">
    import Board from "./components/Board.svelte";
    import { createEmptyBoard, type GameState, revealTile, toggleFlag, revealAllMines, getRemainingMines } from "./lib/minesweeper";

    const rows = 9;
    const cols = 9;
    const mineCount = 10;
    let board = $state(createEmptyBoard(rows, cols));
    let gameState = $state<GameState>('playing');
    const remainingMines = $derived(getRemainingMines(board));

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

    function handleFlag(r: number, c: number) {
        toggleFlag(board, r, c);
    }

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