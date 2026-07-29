<script lang="ts">
    import { type Tile } from "../lib/minesweeper";
    interface Props {
        tile: Tile;
        r: number;
        c: number;
        gameState: 'playing' | 'won' | 'lost';
        onclick: () => void;
        onflag: () => void;
    }
    const { tile, r, c, gameState, onclick, onflag }: Props = $props();
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