import { Terraria } from '../../TL/ModImports.js';
import { ModItem } from '../../TL/ModItem.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
export class LaserPointer extends ModItem {
    constructor() { super(); this.Texture = 'Items/LaserPointer'; }
    SetDefaults() {
        this.CloneDefaults(Terraria.ID.ItemID.LastPrism);
        Object.assign(this.Item, { width: 32, height: 32, damage: 0, mana: 0,
            knockBack: 0, magic: false, summon: false, noMelee: true,
            noUseGraphic: true, channel: true, useTime: 20, useAnimation: 20,
            shootSpeed: 1, value: 50000, rare: 3 });
        this.Item.shoot = ModProjectile.getTypeByName('PointerBeam');
    }
    CanUseItem(item, player) { return player.ownedProjectileCounts[item.shoot] < 1; }
    Shoot(item, player, position, velocity, type, damage, knockBack) {
        Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'](
            player.GetProjectileSource_Item(item), position, velocity, type, 0, 0, player.whoAmI, 0, 0, 0, null);
        return false;
    }
}
