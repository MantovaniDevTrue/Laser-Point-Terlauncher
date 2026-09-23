import { Terraria } from '../../TL/ModImports.js';
import { ModBuff } from '../../TL/ModBuff.js';
import { GlobalHooks } from '../../TL/GlobalHooks.js';
import { eligible, earlyWindow } from '../../Core/PointerMath.js';
import { PointerState } from '../../Core/PointerState.js';
import { immunitySlot } from '../../Core/PointerImmunity.js';
let context = null;
const sharedCooldowns = new Map();
function marked(npc) {
    const type = ModBuff.getTypeByName('Marked');
    for (let i = 0; i < npc.buffType.length; i++)
        if (npc.buffType[i] === type && npc.buffTime[i] > 0) return true;
    return false;
}
export class PointerCombat extends GlobalHooks {
    OnWorldLoad() { sharedCooldowns.clear(); PointerState.targets.clear(); PointerState.beams.clear(); context = null; }
    OnWorldUnload() { sharedCooldowns.clear(); PointerState.targets.clear(); PointerState.beams.clear(); context = null; }
    Initialize() {
        Terraria.NPC.StrikeNPC.hook((original, npc, damage, knockback, direction, crit, noEffect, fromNet, owner) => {
            if (context && !fromNet && marked(npc)) {
                damage += 2;
                context.hits.add(npc.whoAmI);
            }
            return original(npc, damage, knockback, direction, crit, noEffect, fromNet, owner);
        });
        Terraria.Projectile['void Damage()'].hook((original, proj) => {
            const previous = context;
            context = null;
            if (PointerState.targets.size === 0 || !proj.friendly || !eligible(proj, Terraria.ID.ProjectileID.Sets)) {
                try { return original(proj); } finally { context = previous; }
            }
            const active = { hits: new Set() };
            context = active;
            const changed = [];
            try {
                for (const i of PointerState.targets) {
                    const npc = Terraria.Main.npc[i];
                    if (!npc.active || !marked(npc)) { PointerState.targets.delete(i); continue; }
                    const local = proj.usesLocalNPCImmunity;
                    const staticMode = proj.usesIDStaticNPCImmunity;
                    const modes = [];
                    if (local) modes.push([immunitySlot(proj, 'localNPCImmunity', i), proj.localNPCHitCooldown, 0]);
                    if (staticMode) modes.push([immunitySlot(Terraria.Projectile.perIDStaticNPCImmunity, proj.type, i),
                        proj.idStaticNPCHitCooldown, Number(Terraria.Main.GameUpdateCount)]);
                    if (!local && !staticMode) modes.push([immunitySlot(npc, 'immune', proj.owner),
                        sharedCooldowns.get(proj.owner + ':' + i), 0]);
                    for (const [slot, cooldown, base] of modes) {
                        if (!slot) continue;
                        const old = slot.value;
                        if (earlyWindow(Number(old) - base, cooldown)) {
                            changed.push({ slot, remaining: old, npc: i });
                            slot.write(0);
                        }
                    }
                }
                return original(proj);
            } finally {
                for (const entry of changed)
                    if (!active.hits.has(entry.npc) && entry.slot.read() === 0)
                        entry.slot.write(entry.remaining);
                if (!proj.usesLocalNPCImmunity && !proj.usesIDStaticNPCImmunity)
                    for (const id of active.hits) {
                        const time = immunitySlot(Terraria.Main.npc[id], 'immune', proj.owner)?.value ?? 0;
                        if (time > 0) sharedCooldowns.set(proj.owner + ':' + id, time);
                    }
                context = previous;
            }
        });
    }
}
