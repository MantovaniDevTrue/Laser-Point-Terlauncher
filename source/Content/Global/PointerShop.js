import { Terraria } from '../../TL/ModImports.js';
import { ModItem } from '../../TL/ModItem.js';
import { GlobalNPC } from '../../TL/GlobalNPC.js';
export class PointerShop extends GlobalNPC {
    SetupShop(npc, player, shop) {
        if (npc.type === Terraria.ID.NPCID.Mechanic && Terraria.Main.hardMode && Terraria.Main.moonPhase === 0)
            shop.Add(ModItem.getTypeByName('LaserPointer'));
    }
}
