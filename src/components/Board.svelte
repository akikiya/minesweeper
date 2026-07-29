<script lang="ts">
    import { initializeBoard, type Board, type GameState } from "../lib/minesweeper";
    import Tile from "./Tile.svelte";

    interface Props {
        board: Board;
        mineCount: number;
        gameState: GameState;
        onReveal: (r: number, c: number) => GameState;
        onFlag: (r: number, c: number) => void;
    }
    const { board, mineCount, gameState, onReveal, onFlag }: Props = $props();
    let initialized = $state(false);

    $effect(() => {
        board;
        initialized = false;
    });

    function handleClick(r: number, c: number) {
        if (!initialized) {
            initializeBoard(board, mineCount, r, c);
            initialized = true;
        }
        onReveal(r, c);
    }

    function handleRightClick(r: number, c: number) {
        if (gameState !== 'playing') return;
        onFlag(r, c);
    }
</script>

<section id="board">
    {#each board as row, r}
        {#each row as tile, c}
            <Tile
                {tile}
                {r}
                {c}
                {gameState}
                onclick={() => handleClick(r, c)}
                onflag={() => handleRightClick(r, c)}
            />
        {/each}
    {/each}
</section>