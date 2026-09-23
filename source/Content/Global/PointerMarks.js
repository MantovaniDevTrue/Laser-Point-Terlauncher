import { Terraria } from '../../TL/ModImports.js';
import { GlobalHooks } from '../../TL/GlobalHooks.js';
import { PointerState } from '../../Core/PointerState.js';
import { remainingMark, drawMark, drawBeam } from '../../Core/PointerVisuals.js';
export class PointerMarks extends GlobalHooks {
    Initialize() {
        Terraria.Main['void DrawNPCs(bool behindTiles)'].hook((original, self, behindTiles) => {
            original(self, behindTiles);
            if (behindTiles) return;
            for (const [id, state] of PointerState.beams) {
                const proj = state.proj;
                const player = Terraria.Main.player[proj.owner];
                if (!proj.active || !player.active || player.dead || !player.channel ||
                    player.HeldItem.shoot !== proj.type ||
                    (proj.owner === Terraria.Main.myPlayer && !player.controlUseItem)) {
                    PointerState.beams.delete(id);
                    continue;
                }
                drawBeam(proj);
            }
            for (const id of PointerState.targets) {
                const npc = Terraria.Main.npc[id];
                const time = npc.active ? remainingMark(npc) : 0;
                if (time <= 0) { PointerState.targets.delete(id); continue; }
                drawMark(npc, time);
            }
        });
    }
}
