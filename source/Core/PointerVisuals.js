import { Terraria, Microsoft, Modules } from '../TL/ModImports.js';
import { ProjAI } from '../TL/ProjAI.js';
import { ModBuff } from '../TL/ModBuff.js';
const { Vector2, Rectangle, Color } = Modules;
const draw = Terraria.Main['void EntitySpriteDraw(Texture2D texture, Vector2 position, Rectangle sourceRectangle, Color color, float rotation, Vector2 origin, Vector2 scale, SpriteEffects effects, float worthless)'];
export function remainingMark(npc) {
    const type = ModBuff.getTypeByName('Marked');
    for (let i = 0; i < npc.buffType.length; i++)
        if (npc.buffType[i] === type) return Math.max(0, npc.buffTime[i]);
    return 0;
}
export function line(x, y, length, angle, width, color) {
    if (length <= 0) return;
    draw(Terraria.GameContent.TextureAssets.MagicPixel.Value, Vector2.new(x, y),
        Rectangle.new(0, 0, 1, 1), color, angle, Vector2.new(0, 0.5),
        Vector2.new(length, width), Microsoft.Xna.Framework.Graphics.SpriteEffects.None, 0);
}
export function drawMark(npc, time) {
    const progress = Math.min(1, time / 240);
    const eased = progress * progress * (3 - 2 * progress);
    const radius = 6 + Math.min(38, Math.max(npc.width, npc.height) * 0.25 + 16) * eased;
    const x = npc.Center.X - Terraria.Main.screenPosition.X;
    const y = npc.Center.Y - Terraria.Main.screenPosition.Y;
    const fade = Math.min(1, time / 20);
    const red = Color.new(Math.round(255 * fade), Math.round(40 * fade), Math.round(55 * fade));
    const dark = Color.new(Math.round(50 * fade), 0, Math.round(8 * fade));
    for (let i = 0; i < 24; i++) {
        const a = i * Math.PI / 12, b = (i + 1) * Math.PI / 12;
        const px = x + Math.cos(a) * radius, py = y + Math.sin(a) * radius;
        const dx = (Math.cos(b) - Math.cos(a)) * radius;
        const dy = (Math.sin(b) - Math.sin(a)) * radius;
        const length = Math.sqrt(dx * dx + dy * dy), angle = Math.atan2(dy, dx);
        line(px, py, length, angle, 4, dark);
        line(px, py, length, angle, 2, red);
    }
    for (let i = 0; i < 4; i++) {
        const angle = i * Math.PI / 2;
        const start = radius * 0.65;
        const px = x + Math.cos(angle) * start, py = y + Math.sin(angle) * start;
        line(px, py, radius * 0.35 + 7, angle, 4, dark);
        line(px, py, radius * 0.35 + 7, angle, 2, red);
    }
}

export function drawBeam(proj) {
    const start = proj.Center;
    const x = start.X - Terraria.Main.screenPosition.X + Math.cos(proj.rotation) * 32;
    const y = start.Y - Terraria.Main.screenPosition.Y + Math.sin(proj.rotation) * 32;
    const length = Math.max(0, new ProjAI(proj)[1] - 32);
    line(x, y, length, proj.rotation, 3, Color.new(100, 0, 10));
    line(x, y, length, proj.rotation, 2, Color.new(255, 20, 35));
}
