export function rayBox(x, y, dx, dy, bx, by, w, h) {
    let near = 0;
    let far = Infinity;
    if (Math.abs(dx) < 1e-9) {
        if (x < bx || x > bx + w) return null;
    } else {
        let a = (bx - x) / dx;
        let b = (bx + w - x) / dx;
        if (a > b) { const t = a; a = b; b = t; }
        if (a > near) near = a;
        if (b < far) far = b;
        if (near > far) return null;
    }
    if (Math.abs(dy) < 1e-9) {
        if (y < by || y > by + h) return null;
    } else {
        let a = (by - y) / dy;
        let b = (by + h - y) / dy;
        if (a > b) { const t = a; a = b; b = t; }
        if (a > near) near = a;
        if (b < far) far = b;
        if (near > far) return null;
    }
    return near;
}
export function rayNPC(x, y, dx, dy, maxDistance, npc) {
    if (!npc.active || npc.friendly || npc.dontTakeDamage) return null;
    const bx = npc.position.X;
    const by = npc.position.Y;
    const w = npc.width;
    const h = npc.height;
    const cx = bx + w * 0.5 - x;
    const cy = by + h * 0.5 - y;
    const radius = Math.max(w, h) * 0.72 + 2;
    const forward = cx * dx + cy * dy;
    if (forward < -radius || forward > maxDistance + radius) return null;
    if (Math.abs(cx * dy - cy * dx) > radius) return null;
    const distance = rayBox(x, y, dx, dy, bx, by, w, h);
    return distance !== null && distance < maxDistance ? distance : null;
}
export function eligible(proj, sets) {
    return proj.minion || proj.sentry || sets.MinionShot[proj.type] || sets.SentryShot[proj.type];
}
export function earlyWindow(remaining, cooldown) {
    return remaining > 0 && cooldown > 0 && remaining <= Math.floor(cooldown * 0.2);
}
export function acquireLock(state, target) {
    if (state.candidate !== target) { state.candidate = target; state.focus = 0; }
    if (target < 0 || state.locked.has(target)) return false;
    state.focus++;
    if (state.focus < 12) return false;
    state.locked.add(target);
    return true;
}
