<script lang="ts">
    /**
     * Root Svelte component for the Minesweeper game.
     *
     * Manages the top-level game state: the board, current
     * `GameState`, and the derived remaining-mine count.
     * Also holds the configurable board settings (rows, cols,
     * mineCount) so the player can choose a different board
     * configuration before starting a new game.
     *
     * Delegates tile-reveal and flag actions to the logic
     * layer in `src/lib/minesweeper.ts` and provides a
     * `reset` callback for starting a new game.
     */
    import Board from "./components/Board.svelte";
    import {
        createEmptyBoard,
        type GameState,
        type BoardConfig,
        validateBoardConfig,
        revealTile,
        toggleFlag,
        revealAllMines,
        getRemainingMines,
    } from "./lib/minesweeper";

    let config = $state<BoardConfig>({ rows: 9, cols: 9, mineCount: 10 });
    let board = $state(createEmptyBoard(9, 9));
    let gameState = $state<GameState>('playing');
    let errors = $state<string[]>([]);

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
        const validation = validateBoardConfig(config);
        if (!validation.valid) {
            errors = validation.errors;
            return;
        }
        errors = [];
        board = createEmptyBoard(config.rows, config.cols);
        gameState = 'playing';
    }
</script>

<div id="game">
    <div id="config">
        <label>
            Rows
            <input type="number" bind:value={config.rows} min="1" max="30" step="1" />
        </label>
        <label>
            Cols
            <input type="number" bind:value={config.cols} min="1" max="30" step="1" />
        </label>
        <label>
            Mines
            <input
                type="number"
                bind:value={config.mineCount}
                min="0"
                max={config.rows * config.cols - 1}
                step="1"
            />
        </label>
        {#each errors as err}
            <p class="error">{err}</p>
        {/each}
        <button onclick={reset}>New Game</button>
    </div>

    <div id="status">
        <span id="mines">{remainingMines}</span>
        {#if gameState === 'won'}
            <span id="result" data-state="won">You Win!</span>
        {:else if gameState === 'lost'}
            <span id="result" data-state="lost">Game Over</span>
        {/if}
    </div>
    <Board
        {board}
        mineCount={config.mineCount}
        {gameState}
        onReveal={handleReveal}
        onFlag={handleFlag}
    />
</div>

<style>
    #game {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
        padding: 24px 16px;
        flex-grow: 1;
    }

    #status {
        display: flex;
        align-items: center;
        gap: 14px;
        font-family: var(--mono);
        font-size: 20px;
        font-weight: 600;
        letter-spacing: 0.5px;
        user-select: none;
        padding: 8px 16px;
        border-radius: 8px;
        background: var(--code-bg);
        border: 1px solid var(--border);
        box-shadow:
            0 1px 3px rgba(0, 0, 0, 0.06),
            0 4px 12px rgba(0, 0, 0, 0.04);
    }

    #config {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 12px;
        background: var(--border);
        border-radius: 10px;
        padding: 8px 16px;
        box-shadow:
            0 1px 3px rgba(0, 0, 0, 0.06),
            0 4px 12px rgba(0, 0, 0, 0.04);
    }

    #config label {
        display: flex;
        align-items: center;
        gap: 6px;
        font-family: var(--mono);
        font-size: 14px;
        font-weight: 600;
        letter-spacing: 0.5px;
        user-select: none;
        color: var(--text-h);
    }

    #config input {
        width: 64px;
        padding: 4px 8px;
        border-radius: 6px;
        border: 1px solid var(--border);
        background: var(--bg);
        color: var(--text-h);
        font-family: var(--mono);
        font-size: 14px;
        text-align: center;
    }

    #config input:focus-visible {
        outline: 2px solid var(--accent);
        outline-offset: 1px;
    }

    #config .error {
        color: #ef4444;
        font-size: 13px;
        font-family: var(--mono);
        margin: 0;
        width: 100%;
    }

    #config button {
        font-family: var(--sans);
        font-size: 14px;
        font-weight: 600;
        padding: 6px 14px;
        border-radius: 6px;
        border: 1px solid var(--border);
        background: var(--bg);
        color: var(--text-h);
        cursor: pointer;
        transition:
            background 0.15s ease,
            box-shadow 0.15s ease,
            transform 0.08s ease;
    }

    #config button:hover {
        background: var(--accent-bg);
        border-color: var(--accent-border);
        box-shadow: 0 2px 8px rgba(170, 59, 255, 0.12);
    }

    #config button:active {
        transform: scale(0.96);
    }

    #config button:focus-visible {
        outline: 2px solid var(--accent);
        outline-offset: 2px;
    }

    #mines {
        color: var(--accent);
        min-width: 36px;
        text-align: center;
    }

    #result {
        font-weight: 700;
        animation: result-pop 0.35s ease-out;
    }

    #result[data-state='won'] {
        color: #22c55e;
    }

    #result[data-state='lost'] {
        color: #ef4444;
    }

    @keyframes result-pop {
        0% {
            transform: scale(0.5);
            opacity: 0;
        }
        60% {
            transform: scale(1.15);
        }
        100% {
            transform: scale(1);
            opacity: 1;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        #result {
            animation: none;
        }
        #config button {
            transition: none;
        }
    }

    @media (max-width: 480px) {
        #status {
            font-size: 16px;
            gap: 8px;
            padding: 6px 12px;
        }
        #config {
            gap: 8px;
            padding: 6px 12px;
        }
        #config input {
            width: 48px;
        }
        #game {
            gap: 14px;
            padding: 16px 8px;
        }
    }
</style>
