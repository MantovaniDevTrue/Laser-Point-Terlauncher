import { ModSystem } from './TL/ModSystem.js';
import { ModLoader } from './TL/Core/ModLoader.js';
import { LoadContent } from './TL/Core/ContentLoader.js';
import { SystemLoader } from './TL/Loaders/SystemLoader.js';

ModSystem.register(ModLoader);
LoadContent();
SystemLoader.OnModLoad();
