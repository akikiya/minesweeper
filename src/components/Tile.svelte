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
        /** Row index used for CSS custom property `--r` */
        r: number;
        /** Column index used for CSS custom property `--c` */
        c: number;
        /** Current game state; controls whether the tile is interactive and
         *  whether mines are shown (during `'lost'` or `'won'`) */
        gameState: 'playing' | 'won' | 'lost';
        /** Callback invoked on left-click */
        onclick: () => void;
        /** Callback invoked on right-click (flag toggle) */
        onflag: () => void;
    }
    const { tile, r, c, gameState, onclick, onflag }: Props = $props();

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
    style="--r: {r}; --c: {c};"
    data-revealed={tile.revealed}
    data-mine={tile.isMine && (tile.revealed || gameState !== 'playing') ? 'true' : undefined}
    data-flagged={tile.flagged ? 'true' : undefined}
    data-number={tile.revealed && !tile.isMine ? tile.adjacentMines : undefined}
    disabled={gameState !== 'playing'}
    {onclick}
    oncontextmenu={(e) => { e.preventDefault(); onflag(); }}
>{text}</button>