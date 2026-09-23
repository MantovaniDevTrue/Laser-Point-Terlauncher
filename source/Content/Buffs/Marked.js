import { Terraria } from '../../TL/ModImports.js';
import { ModBuff } from '../../TL/ModBuff.js';
export class Marked extends ModBuff {
    constructor() { super(); this.Texture = 'Buffs/Marked'; }
    SetStaticDefaults() {
        Terraria.Main.debuff[this.Type] = true;
        Terraria.Main.buffNoSave[this.Type] = true;
    }
}
