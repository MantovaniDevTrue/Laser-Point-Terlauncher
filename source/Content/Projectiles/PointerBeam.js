import { Terraria, Microsoft, Modules } from '../../TL/ModImports.js';
import { ProjAI } from '../../TL/ProjAI.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ModBuff } from '../../TL/ModBuff.js';
import { PointerState } from '../../Core/PointerState.js';
import { remainingMark } from '../../Core/PointerVisuals.js';
import { rayNPC, acquireLock } from '../../Core/PointerMath.js';
const { Vector2, Color, Rectangle } = Modules;
const draw = Terraria.Main['void EntitySpriteDraw(Texture2D texture, Vector2 position, Rectangle sourceRectangle, Color color, float rotation, Vector2 origin, Vector2 scale, SpriteEffects effects, float worthless)'];
const sound = Terraria.Audio.SoundEngine['SoundEffectInstance PlaySound(LegacySoundStyle type, Vector2 position, float pitchOffset, float volumeScale)'];
const solid = Terraria.Collision['bool SolidCollision(Vector2 Position, int Width, int Height)'];
const MAX_RANGE = 960;
const NPC_LIMIT = 200;
const NPC_SCAN_BATCH = 32;
export class PointerBeam extends ModProjectile {
    constructor() { super(); this.Texture = 'Projectiles/PointerBeam'; }
    SetDefaults() {
        Object.assign(this.Projectile, { width: 4, height: 4, friendly: false,
            hostile: false, damage: 0, penetrate: -1, tileCollide: false,
            ignoreWater: true, timeLeft: 2, aiStyle: -1 });
    }
    CanDamage() { return false; }
    CanCutTiles() { return false; }
    AI(proj) {
        const ai = new ProjAI(proj);
        const player = Terraria.Main.player[proj.owner];
        if (!player.active || player.dead || player.noItems || player.CCed || !player.channel || player.HeldItem.shoot !== proj.type ||
            (proj.owner === Terraria.Main.myPlayer && !player.controlUseItem)) {
            PointerState.beams.delete(proj.whoAmI);
            proj.Kill(); return;
        }
        let state = PointerState.beams.get(proj.whoAmI);
        if (!state || ai[0] === 0) {
            state = { proj, candidate: -1, focus: 0, locked: new Set(), probe: Vector2.new(0, 0), target: -1, scanCursor: 0 };
            PointerState.beams.set(proj.whoAmI, state);
            if (Terraria.Main.netMode !== 2)
                sound(Terraria.ID.SoundID.Item15, player.Center, 0.2, 0.3);
        }
        ai[0]++;
        const start = player.MountedCenter;
        let dx = proj.velocity.X, dy = proj.velocity.Y;
        if (proj.owner === Terraria.Main.myPlayer) {
            dx = Terraria.Main.MouseWorld.X - start.X;
            dy = Terraria.Main.MouseWorld.Y - start.Y;
        }
        const norm = Math.sqrt(dx * dx + dy * dy);
        if (norm > 0.001) { dx /= norm; dy /= norm; } else { dx = player.direction; dy = 0; }
        proj.velocity = Vector2.new(dx, dy);
        proj.Center = start;
        proj.rotation = Math.atan2(dy, dx);
        proj.timeLeft = 2;
        player.ChangeDir(dx >= 0 ? 1 : -1);
        player.heldProj = proj.whoAmI;
        player.itemTime = 2;
        player.itemAnimation = 2;
        player.itemRotation = Math.atan2(dy * player.direction, dx * player.direction);
        let length = MAX_RANGE;
        const probe = state.probe;
        for (let d = 0; d <= MAX_RANGE; d += 16) {
            probe.X = start.X + dx * d;
            probe.Y = start.Y + dy * d;
            if (!solid(probe, 1, 1)) continue;
            const from = Math.max(0, d - 16);
            length = d;
            for (let fine = from; fine < d; fine += 2) {
                probe.X = start.X + dx * fine;
                probe.Y = start.Y + dy * fine;
                if (solid(probe, 1, 1)) { length = fine; break; }
            }
            break;
        }
        let target = null;
        if (state.target >= 0) {
            const npc = Terraria.Main.npc[state.target];
            const distance = rayNPC(start.X, start.Y, dx, dy, length, npc);
            if (distance !== null) { length = distance; target = npc; }
            else state.target = -1;
        }
        for (let count = 0; count < NPC_SCAN_BATCH; count++) {
            const i = state.scanCursor;
            state.scanCursor++;
            if (state.scanCursor >= NPC_LIMIT) state.scanCursor = 0;
            if (i === state.target) continue;
            const npc = Terraria.Main.npc[i];
            const distance = rayNPC(start.X, start.Y, dx, dy, length, npc);
            if (distance !== null) { length = distance; target = npc; }
        }
        state.target = target ? target.whoAmI : -1;
        ai[1] = length;
        if (proj.owner === Terraria.Main.myPlayer && acquireLock(state, target ? target.whoAmI : -1)) {
            if (remainingMark(target) <= 0) {
                target['void AddBuff(int type, int time, bool quiet)'](ModBuff.getTypeByName('Marked'), 240, false);
                if (remainingMark(target) > 0) {
                    PointerState.targets.add(target.whoAmI);
                    player.MinionAttackTargetNPC = target.whoAmI;
                    if (Terraria.Main.netMode !== 2)
                        sound(Terraria.ID.SoundID.Item4, player.Center, 0.4, 0.8);
                }
            }
        }
        if (proj.owner === Terraria.Main.myPlayer) proj.netUpdate = true;
    }
    OnKill(proj) { PointerState.beams.delete(proj.whoAmI); }
    PreDraw(proj) {
        const start = Vector2.Subtract(proj.Center, Terraria.Main.screenPosition);
        const texture = Terraria.GameContent.TextureAssets.Projectile[this.Type].Value;
        const hand = Vector2.new(start.X + Math.cos(proj.rotation) * 16, start.Y + Math.sin(proj.rotation) * 16);
        draw(texture, hand, Rectangle.new(0, 0, texture.Width, texture.Height), Color.White,
            proj.rotation + Math.PI / 4, Vector2.new(texture.Width / 2, texture.Height / 2),
            Vector2.new(1, 1), Microsoft.Xna.Framework.Graphics.SpriteEffects.None, 0);
        return false;
    }
}
