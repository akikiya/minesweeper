<script lang="ts">
    /**
     * Tile component that renders an individual Minesweeper cell.
     *
     * Displays the tile's state (hidden, revealed, flagged, mine)
     * and applies data attributes for CSS styling. The text
     * content is derived based on reveal state, game state, and
     * whether the tile is a mine.
     */
    import { type Tile } from "../lib/minesweeper";

    interface Props {
        /** The tile data model */
        tile: Tile;
        /** Current game state; controls whether the tile is interactive and
         *  whether mines are shown (during `'lost'` or `'won'`) */
        gameState: 'playing' | 'won' | 'lost';
        /** Callback invoked on left-click */
        onclick: () => void;
        /** Callback invoked on right-click (flag toggle) */
        onflag: () => void;
    }
    const { tile, gameState, onclick, onflag }: Props = $props();

    /**
     * Derives the text content rendered inside the tile button.
     *
     * Priority:
     * 1. If revealed, show a mine emoji (💣) or the adjacent mine count.
     * 2. If the game is lost and the tile is a mine, show the bomb emoji
     *    even if the tile is not yet revealed (so the player sees all mines).
     * 3. If flagged (and not revealed), show the flag emoji (🚩).
     * 4. Otherwise, show nothing (tile is hidden).
     */
    const text = $derived.by(() => {
        if (tile.revealed) return tile.isMine ? '💣' : tile.adjacentMines;
        if (gameState === 'lost' && tile.isMine) return '💣';
        return tile.flagged ? '🚩' : '';
    });
</script>

<button
    class="tile"
    data-revealed={tile.revealed}
    data-mine={tile.isMine && (tile.revealed || gameState !== 'playing') ? 'true' : undefined}
    data-flagged={tile.flagged ? 'true' : undefined}
    data-number={tile.revealed && !tile.isMine ? tile.adjacentMines : undefined}
    disabled={gameState !== 'playing'}
    {onclick}
    oncontextmenu={(e) => { e.preventDefault(); onflag(); }}
>{text}</button>

<style>
    .tile {
        aspect-ratio: 1;
        width: 42px;
        height: 42px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        font-weight: 700;
        font-family: var(--sans);
        border: 1px solid transparent;
        border-radius: 4px;
        cursor: pointer;
        background: var(--code-bg);
        color: var(--text-h);
        transition:
            background 0.12s ease,
            box-shadow 0.12s ease,
            transform 0.08s ease;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
    }

    .tile:hover:not([disabled]) {
        background: var(--border);
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    }

    .tile:active:not([disabled]) {
        transform: scale(0.94);
        background: color-mix(in srgb, var(--border) 60%, transparent);
    }

    .tile:focus-visible {
        outline: 2px solid var(--accent);
        outline-offset: 1px;
    }

    .tile[data-revealed='true'] {
        background: var(--bg);
        border-color: var(--border);
        cursor: default;
        box-shadow: none;
    }

    .tile[data-revealed='true']:hover {
        background: var(--bg);
        box-shadow: none;
    }

    .tile[data-revealed='true'][data-mine='true'] {
        background: rgba(239, 68, 68, 0.12);
        border-color: rgba(239, 68, 68, 0.3);
    }

    .tile[data-flagged='true'] {
        color: var(--accent);
    }

    .tile[data-number='1'] {
        color: #2563eb;
    }

    .tile[data-number='2'] {
        color: #16a34a;
    }

    .tile[data-number='3'] {
        color: #dc2626;
    }

    .tile[data-number='4'] {
        color: #7c3aed;
    }

    .tile[data-number='5'] {
        color: #b91c1c;
    }

    .tile[data-number='6'] {
        color: #0d9488;
    }

    .tile[data-number='7'] {
        color: #1f2937;
    }

    .tile[data-number='8'] {
        color: #6b7280;
    }

    .tile[disabled] {
        cursor: default;
        opacity: 0.85;
    }

    @media (max-width: 480px) {
        .tile {
            width: 34px;
            font-size: 15px;
        }
    }

    @media (min-width: 481px) and (max-width: 768px) {
        .tile {
            width: 38px;
            font-size: 16px;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .tile {
            transition: none;
        }
    }
</style>