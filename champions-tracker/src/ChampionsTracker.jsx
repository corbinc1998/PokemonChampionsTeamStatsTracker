import React, { useState, useEffect, useMemo } from "react";
import {
  Plus, X, Search, Trash2, Check, ChevronLeft, Swords, Trophy, Skull,
  Calendar, Edit3, Users, BarChart3, Target, Eye, Sparkles, Download, TrendingUp, TrendingDown,
  ClipboardPaste
} from "lucide-react";
import * as XLSX from "xlsx";

/* --- window.storage shim for real browsers (falls back to localStorage) --- */
if (typeof window !== "undefined" && !window.storage) {
  window.storage = {
    get:    async (k) => { const v = localStorage.getItem(k); return v ? { value: v } : null; },
    set:    async (k, v) => { localStorage.setItem(k, v); return { value: v }; },
    delete: async (k) => { localStorage.removeItem(k); return { deleted: true }; },
    list:   async () => ({ keys: Object.keys(localStorage) }),
  };
}

/* ============================================================================
 * POKÉMON ROSTER (Champions-available)
 * ========================================================================== */
const POKEMON = [
  { dex: 3,   name: "Venusaur",            slug: "venusaur" },
  { dex: 3,   name: "Mega Venusaur",       slug: "venusaur-mega",     mega: true },
  { dex: 6,   name: "Charizard",           slug: "charizard" },
  { dex: 6,   name: "Mega Charizard X",    slug: "charizard-mega-x",  mega: true },
  { dex: 6,   name: "Mega Charizard Y",    slug: "charizard-mega-y",  mega: true },
  { dex: 9,   name: "Blastoise",           slug: "blastoise" },
  { dex: 9,   name: "Mega Blastoise",      slug: "blastoise-mega",    mega: true },
  { dex: 15,  name: "Beedrill",            slug: "beedrill" },
  { dex: 15,  name: "Mega Beedrill",       slug: "beedrill-mega",     mega: true },
  { dex: 18,  name: "Pidgeot",             slug: "pidgeot" },
  { dex: 18,  name: "Mega Pidgeot",        slug: "pidgeot-mega",      mega: true },
  { dex: 24,  name: "Arbok",               slug: "arbok" },
  { dex: 25,  name: "Pikachu",             slug: "pikachu" },
  { dex: 26,  name: "Raichu",              slug: "raichu" },
  { dex: 26,  name: "Alolan Raichu",       slug: "raichu-alola" },
  { dex: 36,  name: "Clefable",            slug: "clefable" },
  { dex: 36,  name: "Mega Clefable",       slug: "clefable-mega",     mega: true },
  { dex: 38,  name: "Ninetales",           slug: "ninetales" },
  { dex: 38,  name: "Alolan Ninetales",    slug: "ninetales-alola" },
  { dex: 59,  name: "Arcanine",            slug: "arcanine" },
  { dex: 59,  name: "Hisuian Arcanine",    slug: "arcanine-hisui" },
  { dex: 65,  name: "Alakazam",            slug: "alakazam" },
  { dex: 65,  name: "Mega Alakazam",       slug: "alakazam-mega",     mega: true },
  { dex: 68,  name: "Machamp",             slug: "machamp" },
  { dex: 71,  name: "Victreebel",          slug: "victreebel" },
  { dex: 71,  name: "Mega Victreebel",     slug: "victreebel-mega",   mega: true },
  { dex: 80,  name: "Slowbro",             slug: "slowbro" },
  { dex: 80,  name: "Galarian Slowbro",    slug: "slowbro-galar" },
  { dex: 80,  name: "Mega Slowbro",        slug: "slowbro-mega",      mega: true },
  { dex: 94,  name: "Gengar",              slug: "gengar" },
  { dex: 94,  name: "Mega Gengar",         slug: "gengar-mega",       mega: true },
  { dex: 115, name: "Kangaskhan",          slug: "kangaskhan" },
  { dex: 115, name: "Mega Kangaskhan",     slug: "kangaskhan-mega",   mega: true },
  { dex: 121, name: "Starmie",             slug: "starmie" },
  { dex: 121, name: "Mega Starmie",        slug: "starmie-mega",      mega: true },
  { dex: 127, name: "Pinsir",              slug: "pinsir" },
  { dex: 127, name: "Mega Pinsir",         slug: "pinsir-mega",       mega: true },
  { dex: 128, name: "Tauros",              slug: "tauros" },
  { dex: 128, name: "Paldean Tauros",      slug: "tauros-paldea-combat" },
  { dex: 130, name: "Gyarados",            slug: "gyarados" },
  { dex: 130, name: "Mega Gyarados",       slug: "gyarados-mega",     mega: true },
  { dex: 132, name: "Ditto",               slug: "ditto" },
  { dex: 134, name: "Vaporeon",            slug: "vaporeon" },
  { dex: 135, name: "Jolteon",             slug: "jolteon" },
  { dex: 136, name: "Flareon",             slug: "flareon" },
  { dex: 142, name: "Aerodactyl",          slug: "aerodactyl" },
  { dex: 142, name: "Mega Aerodactyl",     slug: "aerodactyl-mega",   mega: true },
  { dex: 143, name: "Snorlax",             slug: "snorlax" },
  { dex: 149, name: "Dragonite",           slug: "dragonite" },
  { dex: 149, name: "Mega Dragonite",      slug: "dragonite-mega",    mega: true },
  { dex: 154, name: "Meganium",            slug: "meganium" },
  { dex: 154, name: "Mega Meganium",       slug: "meganium-mega",     mega: true },
  { dex: 157, name: "Typhlosion",          slug: "typhlosion" },
  { dex: 157, name: "Hisuian Typhlosion",  slug: "typhlosion-hisui" },
  { dex: 160, name: "Feraligatr",          slug: "feraligatr" },
  { dex: 160, name: "Mega Feraligatr",     slug: "feraligatr-mega",   mega: true },
  { dex: 168, name: "Ariados",             slug: "ariados" },
  { dex: 181, name: "Ampharos",            slug: "ampharos" },
  { dex: 181, name: "Mega Ampharos",       slug: "ampharos-mega",     mega: true },
  { dex: 184, name: "Azumarill",           slug: "azumarill" },
  { dex: 186, name: "Politoed",            slug: "politoed" },
  { dex: 196, name: "Espeon",              slug: "espeon" },
  { dex: 197, name: "Umbreon",             slug: "umbreon" },
  { dex: 199, name: "Slowking",            slug: "slowking" },
  { dex: 199, name: "Galarian Slowking",   slug: "slowking-galar" },
  { dex: 205, name: "Forretress",          slug: "forretress" },
  { dex: 208, name: "Steelix",             slug: "steelix" },
  { dex: 208, name: "Mega Steelix",        slug: "steelix-mega",      mega: true },
  { dex: 212, name: "Scizor",              slug: "scizor" },
  { dex: 212, name: "Mega Scizor",         slug: "scizor-mega",       mega: true },
  { dex: 214, name: "Heracross",           slug: "heracross" },
  { dex: 214, name: "Mega Heracross",      slug: "heracross-mega",    mega: true },
  { dex: 227, name: "Skarmory",            slug: "skarmory" },
  { dex: 227, name: "Mega Skarmory",       slug: "skarmory-mega",     mega: true },
  { dex: 229, name: "Houndoom",            slug: "houndoom" },
  { dex: 229, name: "Mega Houndoom",       slug: "houndoom-mega",     mega: true },
  { dex: 248, name: "Tyranitar",           slug: "tyranitar" },
  { dex: 248, name: "Mega Tyranitar",      slug: "tyranitar-mega",    mega: true },
  { dex: 279, name: "Pelipper",            slug: "pelipper" },
  { dex: 282, name: "Gardevoir",           slug: "gardevoir" },
  { dex: 282, name: "Mega Gardevoir",      slug: "gardevoir-mega",    mega: true },
  { dex: 302, name: "Sableye",             slug: "sableye" },
  { dex: 302, name: "Mega Sableye",        slug: "sableye-mega",      mega: true },
  { dex: 306, name: "Aggron",              slug: "aggron" },
  { dex: 306, name: "Mega Aggron",         slug: "aggron-mega",       mega: true },
  { dex: 308, name: "Medicham",            slug: "medicham" },
  { dex: 308, name: "Mega Medicham",       slug: "medicham-mega",     mega: true },
  { dex: 310, name: "Manectric",           slug: "manectric" },
  { dex: 310, name: "Mega Manectric",      slug: "manectric-mega",    mega: true },
  { dex: 319, name: "Sharpedo",            slug: "sharpedo" },
  { dex: 319, name: "Mega Sharpedo",       slug: "sharpedo-mega",     mega: true },
  { dex: 323, name: "Camerupt",            slug: "camerupt" },
  { dex: 323, name: "Mega Camerupt",       slug: "camerupt-mega",     mega: true },
  { dex: 324, name: "Torkoal",             slug: "torkoal" },
  { dex: 334, name: "Altaria",             slug: "altaria" },
  { dex: 334, name: "Mega Altaria",        slug: "altaria-mega",      mega: true },
  { dex: 350, name: "Milotic",             slug: "milotic" },
  { dex: 351, name: "Castform",            slug: "castform" },
  { dex: 354, name: "Banette",             slug: "banette" },
  { dex: 354, name: "Mega Banette",        slug: "banette-mega",      mega: true },
  { dex: 358, name: "Chimecho",            slug: "chimecho" },
  { dex: 358, name: "Mega Chimecho",       slug: "chimecho-mega",     mega: true },
  { dex: 359, name: "Absol",               slug: "absol" },
  { dex: 359, name: "Mega Absol",          slug: "absol-mega",        mega: true },
  { dex: 362, name: "Glalie",              slug: "glalie" },
  { dex: 362, name: "Mega Glalie",         slug: "glalie-mega",       mega: true },
  { dex: 389, name: "Torterra",            slug: "torterra" },
  { dex: 392, name: "Infernape",           slug: "infernape" },
  { dex: 395, name: "Empoleon",            slug: "empoleon" },
  { dex: 405, name: "Luxray",              slug: "luxray" },
  { dex: 407, name: "Roserade",            slug: "roserade" },
  { dex: 409, name: "Rampardos",           slug: "rampardos" },
  { dex: 411, name: "Bastiodon",           slug: "bastiodon" },
  { dex: 428, name: "Lopunny",             slug: "lopunny" },
  { dex: 428, name: "Mega Lopunny",        slug: "lopunny-mega",      mega: true },
  { dex: 442, name: "Spiritomb",           slug: "spiritomb" },
  { dex: 445, name: "Garchomp",            slug: "garchomp" },
  { dex: 445, name: "Mega Garchomp",       slug: "garchomp-mega",     mega: true },
  { dex: 448, name: "Lucario",             slug: "lucario" },
  { dex: 448, name: "Mega Lucario",        slug: "lucario-mega",      mega: true },
  { dex: 450, name: "Hippowdon",           slug: "hippowdon" },
  { dex: 454, name: "Toxicroak",           slug: "toxicroak" },
  { dex: 460, name: "Abomasnow",           slug: "abomasnow" },
  { dex: 460, name: "Mega Abomasnow",      slug: "abomasnow-mega",    mega: true },
  { dex: 461, name: "Weavile",             slug: "weavile" },
  { dex: 464, name: "Rhyperior",           slug: "rhyperior" },
  { dex: 470, name: "Leafeon",             slug: "leafeon" },
  { dex: 471, name: "Glaceon",             slug: "glaceon" },
  { dex: 472, name: "Gliscor",             slug: "gliscor" },
  { dex: 473, name: "Mamoswine",           slug: "mamoswine" },
  { dex: 475, name: "Gallade",             slug: "gallade" },
  { dex: 475, name: "Mega Gallade",        slug: "gallade-mega",      mega: true },
  { dex: 478, name: "Froslass",            slug: "froslass" },
  { dex: 478, name: "Mega Froslass",       slug: "froslass-mega",     mega: true },
  { dex: 479, name: "Rotom",               slug: "rotom" },
  { dex: 497, name: "Serperior",           slug: "serperior" },
  { dex: 500, name: "Emboar",              slug: "emboar" },
  { dex: 500, name: "Mega Emboar",         slug: "emboar-mega",       mega: true },
  { dex: 503, name: "Samurott",            slug: "samurott" },
  { dex: 503, name: "Hisuian Samurott",    slug: "samurott-hisui" },
  { dex: 505, name: "Watchog",             slug: "watchog" },
  { dex: 510, name: "Liepard",             slug: "liepard" },
  { dex: 512, name: "Simisage",            slug: "simisage" },
  { dex: 514, name: "Simisear",            slug: "simisear" },
  { dex: 516, name: "Simipour",            slug: "simipour" },
  { dex: 530, name: "Excadrill",           slug: "excadrill" },
  { dex: 530, name: "Mega Excadrill",      slug: "excadrill-mega",    mega: true },
  { dex: 531, name: "Audino",              slug: "audino" },
  { dex: 531, name: "Mega Audino",         slug: "audino-mega",       mega: true },
  { dex: 534, name: "Conkeldurr",          slug: "conkeldurr" },
  { dex: 547, name: "Whimsicott",          slug: "whimsicott" },
  { dex: 553, name: "Krookodile",          slug: "krookodile" },
  { dex: 563, name: "Cofagrigus",          slug: "cofagrigus" },
  { dex: 569, name: "Garbodor",            slug: "garbodor" },
  { dex: 571, name: "Zoroark",             slug: "zoroark" },
  { dex: 571, name: "Hisuian Zoroark",     slug: "zoroark-hisui" },
  { dex: 579, name: "Reuniclus",           slug: "reuniclus" },
  { dex: 584, name: "Vanilluxe",           slug: "vanilluxe" },
  { dex: 587, name: "Emolga",              slug: "emolga" },
  { dex: 609, name: "Chandelure",          slug: "chandelure" },
  { dex: 609, name: "Mega Chandelure",     slug: "chandelure-mega",   mega: true },
  { dex: 614, name: "Beartic",             slug: "beartic" },
  { dex: 618, name: "Stunfisk",            slug: "stunfisk" },
  { dex: 618, name: "Galarian Stunfisk",   slug: "stunfisk-galar" },
  { dex: 623, name: "Golurk",              slug: "golurk" },
  { dex: 623, name: "Mega Golurk",         slug: "golurk-mega",       mega: true },
  { dex: 635, name: "Hydreigon",           slug: "hydreigon" },
  { dex: 637, name: "Volcarona",           slug: "volcarona" },
  { dex: 652, name: "Chesnaught",          slug: "chesnaught" },
  { dex: 652, name: "Mega Chesnaught",     slug: "chesnaught-mega",   mega: true },
  { dex: 655, name: "Delphox",             slug: "delphox" },
  { dex: 655, name: "Mega Delphox",        slug: "delphox-mega",      mega: true },
  { dex: 658, name: "Greninja",            slug: "greninja" },
  { dex: 658, name: "Mega Greninja",       slug: "greninja-mega",     mega: true },
  { dex: 660, name: "Diggersby",           slug: "diggersby" },
  { dex: 663, name: "Talonflame",          slug: "talonflame" },
  { dex: 666, name: "Vivillon",            slug: "vivillon" },
  { dex: 670, name: "Floette",             slug: "floette" },
  { dex: 670, name: "Mega Floette",        slug: "floette-mega",      mega: true },
  { dex: 671, name: "Florges",             slug: "florges" },
  { dex: 675, name: "Pangoro",             slug: "pangoro" },
  { dex: 676, name: "Furfrou",             slug: "furfrou" },
  { dex: 678, name: "Meowstic",            slug: "meowstic" },
  { dex: 678, name: "Mega Meowstic",       slug: "meowstic-mega",     mega: true },
  { dex: 681, name: "Aegislash",           slug: "aegislash" },
  { dex: 683, name: "Aromatisse",          slug: "aromatisse" },
  { dex: 685, name: "Slurpuff",            slug: "slurpuff" },
  { dex: 693, name: "Clawitzer",           slug: "clawitzer" },
  { dex: 695, name: "Heliolisk",           slug: "heliolisk" },
  { dex: 697, name: "Tyrantrum",           slug: "tyrantrum" },
  { dex: 699, name: "Aurorus",             slug: "aurorus" },
  { dex: 700, name: "Sylveon",             slug: "sylveon" },
  { dex: 701, name: "Hawlucha",            slug: "hawlucha" },
  { dex: 701, name: "Mega Hawlucha",       slug: "hawlucha-mega",     mega: true },
  { dex: 702, name: "Dedenne",             slug: "dedenne" },
  { dex: 706, name: "Goodra",              slug: "goodra" },
  { dex: 706, name: "Hisuian Goodra",      slug: "goodra-hisui" },
  { dex: 707, name: "Klefki",              slug: "klefki" },
  { dex: 709, name: "Trevenant",           slug: "trevenant" },
  { dex: 711, name: "Gourgeist",           slug: "gourgeist" },
  { dex: 713, name: "Avalugg",             slug: "avalugg" },
  { dex: 713, name: "Hisuian Avalugg",     slug: "avalugg-hisui" },
  { dex: 715, name: "Noivern",             slug: "noivern" },
  { dex: 724, name: "Decidueye",           slug: "decidueye" },
  { dex: 724, name: "Hisuian Decidueye",   slug: "decidueye-hisui" },
  { dex: 727, name: "Incineroar",          slug: "incineroar" },
  { dex: 730, name: "Primarina",           slug: "primarina" },
  { dex: 733, name: "Toucannon",           slug: "toucannon" },
  { dex: 740, name: "Crabominable",        slug: "crabominable" },
  { dex: 740, name: "Mega Crabominable",   slug: "crabominable-mega", mega: true },
  { dex: 745, name: "Lycanroc",            slug: "lycanroc-midday" },
  { dex: 748, name: "Toxapex",             slug: "toxapex" },
  { dex: 750, name: "Mudsdale",            slug: "mudsdale" },
  { dex: 752, name: "Araquanid",           slug: "araquanid" },
  { dex: 758, name: "Salazzle",            slug: "salazzle" },
  { dex: 763, name: "Tsareena",            slug: "tsareena" },
  { dex: 765, name: "Oranguru",            slug: "oranguru" },
  { dex: 766, name: "Passimian",           slug: "passimian" },
  { dex: 778, name: "Mimikyu",             slug: "mimikyu-disguised" },
  { dex: 780, name: "Drampa",              slug: "drampa" },
  { dex: 780, name: "Mega Drampa",         slug: "drampa-mega",       mega: true },
  { dex: 784, name: "Kommo-o",             slug: "kommo-o" },
  { dex: 823, name: "Corviknight",         slug: "corviknight" },
  { dex: 841, name: "Flapple",             slug: "flapple" },
  { dex: 842, name: "Appletun",            slug: "appletun" },
  { dex: 844, name: "Sandaconda",          slug: "sandaconda" },
  { dex: 855, name: "Polteageist",         slug: "polteageist" },
  { dex: 858, name: "Hatterene",           slug: "hatterene" },
  { dex: 866, name: "Mr. Rime",            slug: "mr-rime" },
  { dex: 867, name: "Runerigus",           slug: "runerigus" },
  { dex: 869, name: "Alcremie",            slug: "alcremie" },
  { dex: 877, name: "Morpeko",             slug: "morpeko" },
  { dex: 887, name: "Dragapult",           slug: "dragapult" },
  { dex: 899, name: "Wyrdeer",             slug: "wyrdeer" },
  { dex: 900, name: "Kleavor",             slug: "kleavor" },
  { dex: 902, name: "Basculegion",         slug: "basculegion-male" },
  { dex: 903, name: "Sneasler",            slug: "sneasler" },
  { dex: 908, name: "Meowscarada",         slug: "meowscarada" },
  { dex: 911, name: "Skeledirge",          slug: "skeledirge" },
  { dex: 914, name: "Quaquaval",           slug: "quaquaval" },
  { dex: 925, name: "Maushold",            slug: "maushold-family-of-four" },
  { dex: 934, name: "Garganacl",           slug: "garganacl" },
  { dex: 936, name: "Armarouge",           slug: "armarouge" },
  { dex: 937, name: "Ceruledge",           slug: "ceruledge" },
  { dex: 939, name: "Bellibolt",           slug: "bellibolt" },
  { dex: 952, name: "Scovillain",          slug: "scovillain" },
  { dex: 952, name: "Mega Scovillain",     slug: "scovillain-mega",   mega: true },
  { dex: 956, name: "Espathra",            slug: "espathra" },
  { dex: 959, name: "Tinkaton",            slug: "tinkaton" },
  { dex: 964, name: "Palafin",             slug: "palafin-zero" },
  { dex: 968, name: "Orthworm",            slug: "orthworm" },
  { dex: 970, name: "Glimmora",            slug: "glimmora" },
  { dex: 970, name: "Mega Glimmora",       slug: "glimmora-mega",     mega: true },
  { dex: 981, name: "Farigiraf",           slug: "farigiraf" },
  { dex: 983, name: "Kingambit",           slug: "kingambit" },
  { dex: 1013,name: "Sinistcha",           slug: "sinistcha" },
  { dex: 1018,name: "Archaludon",          slug: "archaludon" },
  { dex: 1019,name: "Hydrapple",           slug: "hydrapple" },
];

const POKEMON_BY_SLUG = Object.fromEntries(POKEMON.map(p => [p.slug, p]));

/* ============================================================================
 * CHAMPIONS ITEMS
 * ========================================================================== */
const ITEMS_HOLD = [
  "Black Belt", "Black Glasses", "Bright Powder", "Charcoal", "Choice Scarf",
  "Dragon Fang", "Fairy Feather", "Focus Band", "Focus Sash", "Hard Stone",
  "King's Rock", "Leftovers", "Light Ball", "Magnet", "Mental Herb",
  "Metal Coat", "Miracle Seed", "Mystic Water", "Never-Melt Ice", "Poison Barb",
  "Quick Claw", "Scope Lens", "Sharp Beak", "Shell Bell", "Silk Scarf",
  "Silver Powder", "Soft Sand", "Spell Tag", "Twisted Spoon", "White Herb",
];
const ITEMS_MEGA = [
  "Abomasite", "Absolite", "Aerodactylite", "Aggronite", "Alakazite",
  "Altarianite", "Ampharosite", "Audinite", "Banettite", "Beedrillite",
  "Blastoisinite", "Cameruptite", "Chandelurite", "Charizardite X", "Charizardite Y",
  "Chesnaughtite", "Chimechite", "Clefablite", "Crabominite", "Delphoxite",
  "Dragoninite", "Drampanite", "Emboarite", "Excadrite", "Feraligite",
  "Floettite", "Froslassite", "Galladite", "Garchompite", "Gardevoirite",
  "Gengarite", "Glalitite", "Glimmoranite", "Golurkite", "Greninjite",
  "Gyaradosite", "Hawluchanite", "Heracronite", "Houndoominite", "Kangaskhanite",
  "Lopunnite", "Lucarionite", "Manectite", "Medichamite", "Meganiumite",
  "Meowsticite", "Pidgeotite", "Pinsirite", "Sablenite", "Scizorite",
  "Scovillainite", "Sharpedonite", "Skarmorite", "Slowbronite", "Starminite",
  "Steelixite", "Tyranitarite", "Venusaurite", "Victreebelite",
];
const ITEMS_BERRY = [
  "Aspear Berry", "Babiri Berry", "Charti Berry", "Cheri Berry", "Chesto Berry",
  "Chilan Berry", "Chople Berry", "Coba Berry", "Colbur Berry", "Haban Berry",
  "Kasib Berry", "Kebia Berry", "Leppa Berry", "Lum Berry", "Occa Berry",
  "Oran Berry", "Passho Berry", "Payapa Berry", "Pecha Berry", "Persim Berry",
  "Rawst Berry", "Rindo Berry", "Roseli Berry", "Shuca Berry", "Sitrus Berry",
  "Tanga Berry", "Wacan Berry", "Yache Berry",
];
const ITEMS_BY_CATEGORY = [
  { label: "Hold Items", items: ITEMS_HOLD },
  { label: "Mega Stones", items: ITEMS_MEGA },
  { label: "Berries", items: ITEMS_BERRY },
];
const ALL_ITEMS = [...ITEMS_HOLD, ...ITEMS_MEGA, ...ITEMS_BERRY];

/* ============================================================================
 * POKÉPASTE PARSER
 *
 * Showdown's "export format" — spec: github.com/smogon/pokemon-showdown/blob/master/sim/TEAMS.md
 * We only care about Pokémon name, shiny flag, and item. Ability/moves/EVs/IVs/
 * nature/level get parsed but dropped. That way legal PokéPaste strings import
 * without error, even though we don't use the extra fields.
 *
 * Example input:
 *   Orthworm @ Sitrus Berry
 *   Ability: Earth Eater
 *   Level: 50
 *   Shiny: Yes
 *   EVs: 12 HP / 6 Atk / 32 Def / 16 SpD
 *   Impish Nature
 *   - Body Press
 *   - Iron Head
 * ========================================================================== */

/* Normalize a raw name to match our roster. Handles punctuation, forme suffixes
 * ("Tauros-Paldea-Combat"), and Showdown's mega syntax ("Charizard-Mega-X"). */
const normalizeKey = (s) => String(s).toLowerCase()
  .replace(/[^a-z0-9]+/g, "")       // strip spaces, dashes, periods, apostrophes
  .replace(/mega$/, "mega");        // no-op; kept for readability

/* Prebuild a lookup of every known Pokémon by its normalized name. */
const POKEMON_KEY_LOOKUP = (() => {
  const m = {};
  for (const p of POKEMON) {
    m[normalizeKey(p.name)] = p;
    m[normalizeKey(p.slug)] = p;
  }
  // Aliases for common Showdown spellings that don't match our names directly.
  const aliases = {
    // Showdown uses "Charizard-Mega-X" → we want Mega Charizard X
    "charizardmegax": "charizard-mega-x",
    "charizardmegay": "charizard-mega-y",
    // regional form compact forms
    "taurospaldeacombat": "tauros-paldea-combat",
    "taurospaldea": "tauros-paldea-combat",
    "raichualola": "raichu-alola",
    "ninetalesalola": "ninetales-alola",
    "arcaninehisui": "arcanine-hisui",
    "slowbrogalar": "slowbro-galar",
    "slowkinggalar": "slowking-galar",
    "typhlosionhisui": "typhlosion-hisui",
    "samurotthisui": "samurott-hisui",
    "zoroarkhisui": "zoroark-hisui",
    "stunfiskgalar": "stunfisk-galar",
    "goodrahisui": "goodra-hisui",
    "avalugghisui": "avalugg-hisui",
    "decidueyehisui": "decidueye-hisui",
    "lycanroc": "lycanroc-midday",
    "lycanrocmidday": "lycanroc-midday",
    "basculegion": "basculegion-male",
    "basculegionm": "basculegion-male",
    "palafin": "palafin-zero",
    "mimikyu": "mimikyu-disguised",
    "maushold": "maushold-family-of-four",
    "mausholdfour": "maushold-family-of-four",
    "mrrime": "mr-rime",
    "kommoo": "kommo-o",
  };
  for (const [alias, slug] of Object.entries(aliases)) {
    if (POKEMON_BY_SLUG[slug]) m[alias] = POKEMON_BY_SLUG[slug];
  }
  return m;
})();

const findPokemonByName = (raw) => POKEMON_KEY_LOOKUP[normalizeKey(raw)] || null;

/* Item matching is case/punctuation insensitive against our Champions list.
 * If we don't recognize it we keep the raw string — the user can fix in-app. */
const ALL_ITEMS_LOOKUP = (() => {
  const m = {};
  for (const it of ALL_ITEMS) m[normalizeKey(it)] = it;
  return m;
})();
const findItemByName = (raw) => {
  if (!raw) return "";
  const normalized = ALL_ITEMS_LOOKUP[normalizeKey(raw)];
  return normalized || raw.trim();  // keep raw if we don't recognize — user can edit
};

/* Parses the first header line, which is the tricky part.
 * Formats to support:
 *   Orthworm @ Sitrus Berry
 *   Orthworm
 *   Volbeat (M) @ Damp Rock
 *   Nicky (Gardevoir) (F) @ Gardevoirite
 *   Charizard-Mega-Y @ Charizardite Y
 * Returns { speciesRaw, item } or null. */
const parsePokepasteHeader = (line) => {
  // Split off " @ Item" (optional)
  let item = "";
  let namePart = line.trim();
  const atIdx = namePart.lastIndexOf(" @ ");
  if (atIdx >= 0) {
    item = namePart.slice(atIdx + 3).trim();
    namePart = namePart.slice(0, atIdx).trim();
  }
  // Strip trailing gender marker "(M)" / "(F)"
  namePart = namePart.replace(/\s*\((?:M|F)\)\s*$/i, "").trim();
  // If the remaining name has "Nickname (Species)", species wins
  const speciesMatch = namePart.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
  const speciesRaw = speciesMatch ? speciesMatch[2].trim() : namePart;
  return { speciesRaw, item };
};

/* Parse a full PokéPaste string. Returns { slots, errors, rawCount } where
 * slots is an array of up to 6 {pokemonSlug, item, shiny} and errors is an
 * array of human-readable warnings for unmatched species. */
const parsePokepaste = (text) => {
  // Blocks separated by blank lines. Trim trailing spaces from each line
  // (Showdown's export format adds two-space line endings).
  const blocks = text
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n+/)
    .map(b => b.trim())
    .filter(Boolean);

  const slots = [];
  const errors = [];

  for (const block of blocks) {
    if (slots.length >= 6) break;  // Champions teams are 6 max
    const lines = block.split("\n").map(l => l.replace(/\s+$/, ""));
    if (!lines.length) continue;

    const header = parsePokepasteHeader(lines[0]);
    if (!header) continue;

    const poke = findPokemonByName(header.speciesRaw);
    if (!poke) {
      errors.push(`Couldn't match "${header.speciesRaw}" — skipped.`);
      continue;
    }

    let shiny = false;
    // Scan the remaining lines for "Shiny: Yes" (rest we ignore)
    for (const l of lines.slice(1)) {
      const m = l.match(/^\s*Shiny:\s*(Yes|Y|True)\s*$/i);
      if (m) { shiny = true; break; }
    }

    slots.push({
      pokemonSlug: poke.slug,
      item: findItemByName(header.item),
      shiny,
    });
  }

  return { slots, errors, rawCount: blocks.length };
};

const itemSlug = (name) => name.toLowerCase().replace(/['\s]/g, "");
const itemImageUrl = (name) => `https://www.serebii.net/itemdex/sprites/${itemSlug(name)}.png`;

const ItemIcon = ({ name, size = 18 }) => {
  if (!name) return null;
  return (
    <img
      src={itemImageUrl(name)}
      alt=""
      width={size}
      height={size}
      className="item-icon"
      onError={(e) => { e.currentTarget.style.visibility = "hidden"; }}
    />
  );
};

/* ============================================================================
 * STORAGE + MIGRATION
 * ========================================================================== */
const K_TEAMS   = "champions:teams";
const K_BATTLES = "champions:battles";

const safeGet = async (key, fallback) => {
  try {
    const r = await window.storage.get(key);
    return r?.value ? JSON.parse(r.value) : fallback;
  } catch { return fallback; }
};
const safeSet = async (key, value) => {
  try { await window.storage.set(key, JSON.stringify(value)); } catch (e) { console.error("storage", e); }
};

const normalizeSlot = (s) => ({
  pokemonSlug: s?.pokemonSlug ?? null,
  item: s?.item || "",
  shiny: !!s?.shiny,
});

const teamCompositionKey = (slots) =>
  slots.map(s => s?.pokemonSlug).filter(Boolean).sort().join("|");

const migrateIfNeeded = (teams, battles) => {
  // Ensure every team slot has the shiny field.
  const normalizedTeams = teams.map(t => ({
    ...t,
    slots: (t.slots || []).map(normalizeSlot),
  }));

  const teamsById = Object.fromEntries(normalizedTeams.map(t => [t.id, t]));
  const teamIdByKey = Object.fromEntries(
    normalizedTeams.map(t => [teamCompositionKey(t.slots), t.id])
  );
  const newTeams = [...normalizedTeams];

  const newBattles = battles.map(b => {
    const normalized = {
      ...b,
      myTeam: (b.myTeam || []).map(normalizeSlot),
      opponentTeam: (b.opponentTeam || []).map(normalizeSlot),
      brought: b.brought ?? [],
      leads: b.leads ?? [],
      seen: b.seen ?? [],
      oppLeads: b.oppLeads ?? [],
    };
    if (normalized.teamId && teamsById[normalized.teamId]) return normalized;
    const key = teamCompositionKey(normalized.myTeam);
    if (!key) return normalized;
    let teamId = teamIdByKey[key];
    if (!teamId) {
      teamId = crypto.randomUUID();
      const team = {
        id: teamId,
        name: `Team ${newTeams.length + 1}`,
        slots: normalized.myTeam.map(normalizeSlot),
        createdAt: normalized.createdAt || Date.now(),
        updatedAt: Date.now(),
      };
      newTeams.push(team);
      teamIdByKey[key] = teamId;
    }
    return { ...normalized, teamId };
  });
  return { teams: newTeams, battles: newBattles };
};

/* ============================================================================
 * SHOWDOWN SPRITES
 * ========================================================================== */
const SHOWDOWN_OVERRIDES = {
  "charizard-mega-x":        "charizard-megax",
  "charizard-mega-y":        "charizard-megay",
  "tauros-paldea-combat":    "tauros-paldeacombat",
  "mimikyu-disguised":       "mimikyu",
  "lycanroc-midday":         "lycanroc",
  "basculegion-male":        "basculegion",
  "palafin-zero":            "palafin",
  "maushold-family-of-four": "maushold",
  "kommo-o":                 "kommoo",
  "mr-rime":                 "mrrime",
};
const toShowdownSlug = (slug) => SHOWDOWN_OVERRIDES[slug] ?? slug;
const spriteUrl = (slug, shiny) => {
  const folder = shiny ? "gen5-shiny" : "gen5";
  return `https://play.pokemonshowdown.com/sprites/${folder}/${toShowdownSlug(slug)}.png`;
};

/* PokeImage takes a `shiny` prop directly now (was previously context-based).
 * Per-slot shiny means each call site passes the slot's shiny flag. */
const PokeImage = ({ slug, size = 96, shiny = false }) => {
  if (!slug) return <div className="poke-placeholder" style={{ width: size, height: size }} />;
  return (
    <img
      src={spriteUrl(slug, shiny)}
      alt=""
      width={size}
      height={size}
      className="poke-img"
      onError={(e) => {
        if (shiny && !e.currentTarget.dataset.fellBack) {
          e.currentTarget.dataset.fellBack = "1";
          e.currentTarget.src = spriteUrl(slug, false);
        }
      }}
    />
  );
};

/* ============================================================================
 * XLSX EXPORT (multi-sheet, SheetJS)
 *
 * Produces a workbook with:
 *   - Battles   : one row per match; leads split from back-line
 *   - Teams     : each team as a row with its 6 Pokémon + record + WR
 *   - You Used  : Pokémon you brought most, counted + with WR
 *   - Your Leads: your front-line Pokémon, counted + with WR
 *   - Lost To   : opponent Pokémon seen in battles you LOST
 *   - You Beat  : opponent Pokémon seen in battles you WON
 *   - Opp Leads : opponent front-line Pokémon + your WR against each
 *
 * The stats sheets put an IMAGE() formula in the Sprite column. Excel 365 and
 * Google Sheets render the sprite inline; older Excel shows #NAME? (no crash).
 * ========================================================================== */

const formatMySlot = (slot) => {
  if (!slot?.pokemonSlug) return "";
  const poke = POKEMON_BY_SLUG[slot.pokemonSlug];
  const name = poke?.name ?? slot.pokemonSlug;
  const shinyMark = slot.shiny ? " ✨" : "";
  return slot.item ? `${name}${shinyMark} @ ${slot.item}` : `${name}${shinyMark}`;
};

const formatOppSlot = (slot, seenInfo) => {
  if (!slot?.pokemonSlug) return "";
  const poke = POKEMON_BY_SLUG[slot.pokemonSlug];
  const name = poke?.name ?? slot.pokemonSlug;
  const shinyMark = slot.shiny ? " ✨" : "";
  if (!slot.item) return `${name}${shinyMark}`;
  if (seenInfo?.itemRevealed) return `${name}${shinyMark} @ ${slot.item}`;
  return `${name}${shinyMark} @ ? (guess: ${slot.item})`;
};

const addBattlesSheet = (wb, battles, teams) => {
  const teamById = Object.fromEntries(teams.map(t => [t.id, t]));

  const header = [
    "Date", "Result", "Team", "Opponent",
    "Your Lead 1", "Your Lead 2", "Your Back 1", "Your Back 2", "Your Full Team",
    "Opp Lead 1", "Opp Lead 2", "Opp Seen 3", "Opp Seen 4", "Opp Full Team",
    "Notes",
  ];

  const rows = [...battles]
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
    .map(b => {
      const team = teamById[b.teamId];
      const teamName = team?.name || "(unlinked)";
      const leadsSet = new Set(b.leads || []);
      const myLeadSlots = (b.brought || []).filter(i => leadsSet.has(i)).map(i => b.myTeam[i]);
      const myBackSlots = (b.brought || []).filter(i => !leadsSet.has(i)).map(i => b.myTeam[i]);
      const fullMyTeam = b.myTeam.filter(s => s?.pokemonSlug).map(formatMySlot).join(" | ");

      const oppLeadsSet = new Set(b.oppLeads || []);
      const seenLeads = (b.seen || []).filter(s => oppLeadsSet.has(s.index));
      const seenBack  = (b.seen || []).filter(s => !oppLeadsSet.has(s.index));
      const fullOppTeam = b.opponentTeam
        .map((s, idx) => ({ s, idx }))
        .filter(({ s }) => s?.pokemonSlug)
        .map(({ s, idx }) => formatOppSlot(s, (b.seen || []).find(x => x.index === idx)))
        .join(" | ");

      return [
        b.date,
        b.result === "win" ? "W" : "L",
        teamName,
        b.opponentName || "",
        formatMySlot(myLeadSlots[0]),
        formatMySlot(myLeadSlots[1]),
        formatMySlot(myBackSlots[0]),
        formatMySlot(myBackSlots[1]),
        fullMyTeam,
        seenLeads[0] ? formatOppSlot(b.opponentTeam[seenLeads[0].index], seenLeads[0]) : "",
        seenLeads[1] ? formatOppSlot(b.opponentTeam[seenLeads[1].index], seenLeads[1]) : "",
        seenBack[0]  ? formatOppSlot(b.opponentTeam[seenBack[0].index],  seenBack[0])  : "",
        seenBack[1]  ? formatOppSlot(b.opponentTeam[seenBack[1].index],  seenBack[1])  : "",
        fullOppTeam,
        b.notes || "",
      ];
    });

  const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
  ws["!cols"] = [
    { wch: 11 }, { wch: 7 },  { wch: 20 }, { wch: 18 },
    { wch: 28 }, { wch: 28 }, { wch: 28 }, { wch: 28 }, { wch: 60 },
    { wch: 32 }, { wch: 32 }, { wch: 32 }, { wch: 32 }, { wch: 60 },
    { wch: 40 },
  ];
  // Freeze the header row so leads columns stay readable while scrolling.
  ws["!freeze"] = { xSplit: 0, ySplit: 1 };
  XLSX.utils.book_append_sheet(wb, ws, "Battles");
};

const addTeamsSheet = (wb, teams, battles) => {
  const header = [
    "Team Name",
    "Pokémon 1", "Pokémon 2", "Pokémon 3", "Pokémon 4", "Pokémon 5", "Pokémon 6",
    "Battles", "Wins", "Losses", "Win Rate",
  ];

  const rows = teams.map(t => {
    const tb = battles.filter(b => b.teamId === t.id);
    const wins = tb.filter(b => b.result === "win").length;
    const losses = tb.filter(b => b.result === "loss").length;
    const total = tb.length;
    const wrPct = total ? Math.round((wins / total) * 100) : null;

    const activeSlots = t.slots.filter(s => s.pokemonSlug);
    const pokeCells = Array.from({ length: 6 }, (_, i) => {
      const slot = activeSlots[i];
      return slot ? formatMySlot(slot) : "";
    });

    return [
      t.name,
      ...pokeCells,
      total, wins, losses,
      wrPct === null ? "—" : `${wrPct}%`,
    ];
  });

  const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
  ws["!cols"] = [
    { wch: 24 },
    { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 30 },
    { wch: 9 },  { wch: 7 },  { wch: 8 },  { wch: 10 },
  ];
  ws["!freeze"] = { xSplit: 1, ySplit: 1 };
  XLSX.utils.book_append_sheet(wb, ws, "Teams");
};

const addStatsSheet = (wb, sheetName, entries, { showWR = true } = {}) => {
  const header = showWR
    ? ["Dex #", "Pokémon", "Sprite", "Count", "Wins", "Losses", "Win Rate"]
    : ["Dex #", "Pokémon", "Sprite", "Count"];

  const rows = entries.map(e => {
    const poke = POKEMON_BY_SLUG[e.slug];
    const name = poke?.name || e.slug;
    const dex = `#${String(poke?.dex ?? 0).padStart(4, "0")}`;
    if (showWR) {
      const wr = e.count ? Math.round((e.wins / e.count) * 100) : 0;
      return [dex, name, "", e.count, e.wins, e.losses, `${wr}%`];
    }
    return [dex, name, "", e.count];
  });

  const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);

  // Patch the Sprite column (C, index 2) with IMAGE() formulas.
  // `f` puts a formula in the cell; Excel 365 / Google Sheets render the
  // pokemon inline. Older Excel shows a broken-formula ref but doesn't crash.
  entries.forEach((e, idx) => {
    const addr = `C${idx + 2}`;
    ws[addr] = { t: "s", v: "", f: `IMAGE("${spriteUrl(e.slug, false)}")` };
  });

  ws["!cols"] = showWR
    ? [{ wch: 8 }, { wch: 22 }, { wch: 12 }, { wch: 8 }, { wch: 6 }, { wch: 8 }, { wch: 10 }]
    : [{ wch: 8 }, { wch: 22 }, { wch: 12 }, { wch: 8 }];

  // Taller rows so sprites aren't crushed.
  ws["!rows"] = [{ hpt: 18 }, ...entries.map(() => ({ hpt: 54 }))];
  ws["!freeze"] = { xSplit: 0, ySplit: 1 };

  XLSX.utils.book_append_sheet(wb, ws, sheetName);
};

const buildWorkbook = (battles, teams) => {
  const wb = XLSX.utils.book_new();
  addBattlesSheet(wb, battles, teams);
  addTeamsSheet(wb, teams, battles);

  const stats = computeGlobalStats(battles);
  addStatsSheet(wb, "You Used",   stats.yourUsed,  { showWR: true });
  addStatsSheet(wb, "Your Leads", stats.yourLeads, { showWR: true });
  addStatsSheet(wb, "Lost To",    stats.beatYou,   { showWR: false });
  addStatsSheet(wb, "You Beat",   stats.youBeat,   { showWR: false });
  addStatsSheet(wb, "Opp Leads",  stats.oppLeads,  { showWR: true });
  return wb;
};

const exportBattles = (battles, teams) => {
  const wb = buildWorkbook(battles, teams);
  const date = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `champions-tracker-${date}.xlsx`);
};

/* ============================================================================
 * UI ATOMS
 * ========================================================================== */
const Btn = ({ children, className = "", variant = "default", disabled, ...p }) => (
  <button {...p} disabled={disabled}
    className={`btn btn-${variant} ${disabled ? "is-disabled" : ""} ${className}`}>
    {children}
  </button>
);

const Modal = ({ open, onClose, children, title }) => {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="serif modal-title">{title}</h3>
          <button onClick={onClose} className="icon-btn"><X size={18} /></button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, accent }) => (
  <div className="stat-card">
    <div className="label-xs">{label}</div>
    <div className={`stat-value ${accent ? `accent-${accent}` : ""}`}>{value}</div>
  </div>
);

/* ============================================================================
 * PICKERS
 * ========================================================================== */
const PokemonPicker = ({ open, onClose, onPick }) => {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return POKEMON;
    return POKEMON.filter(p =>
      p.name.toLowerCase().includes(qq) ||
      String(p.dex).padStart(4, "0").includes(qq)
    );
  }, [q]);

  return (
    <Modal open={open} onClose={onClose} title="Select Pokémon">
      <div className="picker-search">
        <div className="input-wrap">
          <Search size={16} className="input-icon" />
          <input autoFocus value={q} onChange={e => setQ(e.target.value)}
            placeholder="Search by name or dex #…"
            className="input input-with-icon" />
        </div>
      </div>
      <div className="picker-grid">
        {filtered.map(p => (
          <button key={p.slug} onClick={() => { onPick(p); onClose(); }} className="picker-item">
            <PokeImage slug={p.slug} size={72} />
            <div className="dex-num">#{String(p.dex).padStart(4, "0")}</div>
            <div className="poke-name">{p.name}</div>
          </button>
        ))}
        {filtered.length === 0 && <div className="picker-empty">No matches.</div>}
      </div>
    </Modal>
  );
};

const ItemPicker = ({ open, onClose, onPick, currentValue }) => {
  const [q, setQ] = useState("");
  const filteredCategories = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return ITEMS_BY_CATEGORY;
    return ITEMS_BY_CATEGORY
      .map(cat => ({ ...cat, items: cat.items.filter(i => i.toLowerCase().includes(qq)) }))
      .filter(cat => cat.items.length > 0);
  }, [q]);
  const submitCustom = () => {
    const trimmed = q.trim();
    if (trimmed) { onPick(trimmed); onClose(); }
  };
  const existsInList = q.trim() && ALL_ITEMS.find(i => i.toLowerCase() === q.trim().toLowerCase());
  return (
    <Modal open={open} onClose={onClose} title="Select Item">
      <div className="picker-search">
        <div className="input-wrap">
          <Search size={16} className="input-icon" />
          <input autoFocus value={q} onChange={e => setQ(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") submitCustom(); }}
            placeholder="Search or type a custom item…"
            className="input input-with-icon" />
        </div>
        <div className="picker-actions">
          <Btn variant="ghost" onClick={() => { onPick(""); onClose(); }}>No item</Btn>
          {q.trim() && !existsInList && (
            <Btn variant="primary" onClick={submitCustom}>Use "{q.trim()}"</Btn>
          )}
        </div>
      </div>
      <div className="item-picker-body">
        {filteredCategories.map(cat => (
          <div key={cat.label} className="item-cat">
            <div className="item-cat-label">{cat.label}</div>
            <div className="item-grid">
              {cat.items.map(item => (
                <button key={item} onClick={() => { onPick(item); onClose(); }}
                  className={`item-chip ${currentValue === item ? "item-chip-active" : ""}`}>
                  <ItemIcon name={item} size={24} />
                  <span className="item-chip-name">{item}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
        {filteredCategories.length === 0 && (
          <div className="picker-empty">No matches. Press Enter to use "{q.trim()}" as a custom item.</div>
        )}
      </div>
    </Modal>
  );
};

/* ============================================================================
 * TEAM SLOT + BUILDER
 * ========================================================================== */
const TeamSlot = ({ slot, idx, onPickPokemon, onPickItem, onToggleShiny, onClear }) => {
  const poke = slot.pokemonSlug ? POKEMON_BY_SLUG[slot.pokemonSlug] : null;
  return (
    <div className="slot">
      <div className="slot-header">
        <span className="label-xs">Slot {idx + 1}</span>
        {slot.pokemonSlug && (
          <div className="slot-header-actions">
            <button
              onClick={onToggleShiny}
              className={`slot-shiny-btn ${slot.shiny ? "is-on" : ""}`}
              title={slot.shiny ? "Shiny — click to turn off" : "Mark as shiny"}
              type="button"
            >
              <Sparkles size={12} />
            </button>
            <button onClick={onClear} className="slot-clear" title="Clear slot">
              <X size={14} />
            </button>
          </div>
        )}
      </div>
      <button onClick={onPickPokemon} className="slot-pick">
        {poke ? (
          <>
            <PokeImage slug={poke.slug} size={88} shiny={slot.shiny} />
            <div className="dex-num">#{String(poke.dex).padStart(4, "0")}</div>
            <div className="poke-name">{poke.name}</div>
          </>
        ) : (
          <div className="slot-empty">
            <Plus size={20} />
            <span className="label-xs">Add Pokémon</span>
          </div>
        )}
      </button>
      <button onClick={onPickItem} disabled={!slot.pokemonSlug} className="slot-item-btn">
        {slot.item ? <ItemIcon name={slot.item} size={16} /> : null}
        <span className="slot-item-label">{slot.item ? "" : "item: "}</span>
        <span className="slot-item-value">{slot.item || "—"}</span>
      </button>
    </div>
  );
};

const TeamBuilder = ({ team, setTeam, label }) => {
  const [pickerSlot, setPickerSlot] = useState(null);
  const [itemSlot, setItemSlot] = useState(null);
  const update = (i, patch) => setTeam(team.map((s, idx) => idx === i ? { ...s, ...patch } : s));
  return (
    <div>
      <div className="section-head">
        <h2 className="serif section-title">{label}</h2>
        <span className="label-xs">{team.filter(s => s.pokemonSlug).length} / 6</span>
      </div>
      <div className="team-grid">
        {team.map((slot, i) => (
          <TeamSlot key={i} slot={slot} idx={i}
            onPickPokemon={() => setPickerSlot(i)}
            onPickItem={() => setItemSlot(i)}
            onToggleShiny={() => update(i, { shiny: !slot.shiny })}
            onClear={() => update(i, { pokemonSlug: null, item: "", shiny: false })} />
        ))}
      </div>
      <PokemonPicker open={pickerSlot !== null} onClose={() => setPickerSlot(null)}
        onPick={(p) => update(pickerSlot, { pokemonSlug: p.slug })} />
      <ItemPicker open={itemSlot !== null} onClose={() => setItemSlot(null)}
        onPick={(item) => update(itemSlot, { item })}
        currentValue={itemSlot !== null ? team[itemSlot]?.item : ""} />
    </div>
  );
};

/* ============================================================================
 * BATTLE SELECTORS
 * ========================================================================== */
const BroughtSelector = ({ team, brought, setBrought, label, max = 4 }) => {
  const toggle = (i) => {
    if (brought.includes(i)) setBrought(brought.filter(x => x !== i));
    else if (brought.length < max) setBrought([...brought, i]);
  };
  const activeIdxs = team.map((s, i) => s.pokemonSlug ? i : null).filter(i => i !== null);
  return (
    <div>
      <div className="section-head">
        <h2 className="serif section-title">{label}</h2>
        <span className="label-xs">{brought.length} / {max}</span>
      </div>
      <div className="team-grid">
        {activeIdxs.map(i => {
          const slot = team[i];
          const poke = POKEMON_BY_SLUG[slot.pokemonSlug];
          const isOn = brought.includes(i);
          return (
            <button key={i} onClick={() => toggle(i)}
              className={`poke-card ${isOn ? "poke-card-on" : ""}`}>
              {isOn && <div className="poke-card-check"><Check size={12} /></div>}
              <PokeImage slug={poke.slug} size={72} shiny={slot.shiny} />
              <div className="dex-num">#{String(poke.dex).padStart(4, "0")}</div>
              <div className="poke-name">{poke.name}</div>
              {slot.item && (
                <div className="poke-item">
                  <ItemIcon name={slot.item} size={12} /> {slot.item}
                </div>
              )}
            </button>
          );
        })}
        {activeIdxs.length === 0 && <div className="poke-grid-empty">Fill in the team above first.</div>}
      </div>
    </div>
  );
};

const OpponentSeenSelector = ({ team, seen, setSeen, max = 4 }) => {
  const activeIdxs = team.map((s, i) => s.pokemonSlug ? i : null).filter(i => i !== null);
  const isSeen = (i) => seen.some(s => s.index === i);
  const getSeen = (i) => seen.find(s => s.index === i);
  const toggle = (i) => {
    if (isSeen(i)) setSeen(seen.filter(s => s.index !== i));
    else if (seen.length < max) setSeen([...seen, { index: i, itemRevealed: false }]);
  };
  const toggleItem = (i) =>
    setSeen(seen.map(s => s.index === i ? { ...s, itemRevealed: !s.itemRevealed } : s));
  return (
    <div>
      <div className="section-head">
        <h2 className="serif section-title">Opponent's Brought</h2>
        <span className="label-xs">{seen.length} / {max} seen</span>
        <span className="label-xs dim">tap item badge to toggle "revealed"</span>
      </div>
      <div className="team-grid">
        {activeIdxs.map(i => {
          const slot = team[i];
          const poke = POKEMON_BY_SLUG[slot.pokemonSlug];
          const on = isSeen(i);
          const s = getSeen(i);
          return (
            <div key={i} className={`poke-card ${on ? "poke-card-on" : ""}`}>
              <button onClick={() => toggle(i)} className="poke-card-body">
                {on && <div className="poke-card-check"><Check size={12} /></div>}
                <PokeImage slug={poke.slug} size={72} shiny={slot.shiny} />
                <div className="dex-num">#{String(poke.dex).padStart(4, "0")}</div>
                <div className="poke-name">{poke.name}</div>
              </button>
              {slot.item && on && (
                <button onClick={() => toggleItem(i)}
                  className={`item-reveal-badge ${s?.itemRevealed ? "item-reveal-on" : ""}`}>
                  <ItemIcon name={slot.item} size={12} />
                  {s?.itemRevealed ? " ✓ " : " ? "}{slot.item}
                </button>
              )}
            </div>
          );
        })}
        {activeIdxs.length === 0 && <div className="poke-grid-empty">Fill in the opponent's team above first.</div>}
      </div>
    </div>
  );
};

const LeadsSelector = ({ team, pool, leads, setLeads, label, max = 2 }) => {
  const toggle = (i) => {
    if (leads.includes(i)) setLeads(leads.filter(x => x !== i));
    else if (leads.length < max) setLeads([...leads, i]);
  };
  return (
    <div>
      <div className="section-head">
        <h2 className="serif section-title">{label}</h2>
        <span className="label-xs">{leads.length} / {max} in front</span>
      </div>
      {pool.length === 0 ? (
        <div className="poke-grid-empty">Select who was brought first.</div>
      ) : (
        <div className="leads-grid">
          {pool.map(i => {
            const slot = team[i];
            if (!slot?.pokemonSlug) return null;
            const poke = POKEMON_BY_SLUG[slot.pokemonSlug];
            const isOn = leads.includes(i);
            return (
              <button key={i} onClick={() => toggle(i)}
                className={`poke-card ${isOn ? "poke-card-lead-on" : ""}`}>
                {isOn && <div className="lead-badge">LEAD</div>}
                <PokeImage slug={poke.slug} size={72} shiny={slot.shiny} />
                <div className="dex-num">#{String(poke.dex).padStart(4, "0")}</div>
                <div className="poke-name">{poke.name}</div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ============================================================================
 * POKÉPASTE IMPORT MODAL
 * ========================================================================== */
const PokepasteImportModal = ({ open, onClose, onImport }) => {
  const [text, setText] = useState("");
  const [preview, setPreview] = useState(null);

  // Re-parse live as the user types so the preview is always in sync.
  useEffect(() => {
    if (!text.trim()) { setPreview(null); return; }
    setPreview(parsePokepaste(text));
  }, [text]);

  const handleImport = () => {
    if (!preview || preview.slots.length === 0) return;
    onImport(preview.slots);
    setText("");
    setPreview(null);
    onClose();
  };

  const handleClose = () => {
    setText("");
    setPreview(null);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Import from PokéPaste">
      <div className="import-body">
        <p className="label-xs dim" style={{ lineHeight: 1.6 }}>
          Paste a Showdown export / PokéPaste team below. Only Pokémon species,
          held items, and shiny flags are imported — abilities, moves, EVs, and
          natures are ignored.
        </p>

        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={14}
          placeholder={`Orthworm @ Sitrus Berry\nAbility: Earth Eater\nLevel: 50\nShiny: Yes\nEVs: 12 HP / 6 Atk / 32 Def / 16 SpD\nImpish Nature\n- Body Press\n- Iron Head\n- Sandstorm\n- Shed Tail\n\n(paste up to 6 Pokémon, separated by blank lines)`}
          className="input textarea import-textarea"
        />

        {preview && (
          <div className="import-preview">
            <div className="label-xs">
              Parsed {preview.slots.length} of {preview.rawCount} Pokémon block{preview.rawCount !== 1 ? "s" : ""}
            </div>

            {preview.slots.length > 0 && (
              <div className="import-preview-grid">
                {preview.slots.map((slot, i) => {
                  const poke = POKEMON_BY_SLUG[slot.pokemonSlug];
                  return (
                    <div key={i} className="import-preview-card">
                      <PokeImage slug={slot.pokemonSlug} size={56} shiny={slot.shiny} />
                      <div className="poke-name">
                        {poke?.name}
                        {slot.shiny && <span className="shiny-star"> ✨</span>}
                      </div>
                      {slot.item && (
                        <div className="poke-item">
                          <ItemIcon name={slot.item} size={12} /> {slot.item}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {preview.errors.length > 0 && (
              <div className="import-errors">
                {preview.errors.map((e, i) => (
                  <div key={i} className="import-error">⚠ {e}</div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="import-actions">
          <Btn variant="ghost" onClick={handleClose}>Cancel</Btn>
          <Btn variant="primary" onClick={handleImport} disabled={!preview || preview.slots.length === 0}>
            Import {preview?.slots.length ? `(${preview.slots.length})` : ""}
          </Btn>
        </div>
      </div>
    </Modal>
  );
};

/* ============================================================================
 * TEAM EDITOR
 * ========================================================================== */
const emptyTeam = () => Array(6).fill(null).map(() => ({ pokemonSlug: null, item: "", shiny: false }));

const TeamEditorView = ({ editing, onSave, onCancel, onDelete }) => {
  const [name, setName] = useState(editing?.name ?? "");
  const [slots, setSlots] = useState(editing?.slots ?? emptyTeam());
  const [importOpen, setImportOpen] = useState(false);
  const canSave = name.trim() && slots.some(s => s.pokemonSlug);

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      id: editing?.id ?? crypto.randomUUID(),
      name: name.trim(),
      slots: slots.map(normalizeSlot),
      createdAt: editing?.createdAt ?? Date.now(),
      updatedAt: Date.now(),
    });
  };

  // Merge imported slots into the current team. Fills from slot 0 onward,
  // overwriting whatever's there. Extra imported Pokémon beyond 6 are ignored
  // (the parser already caps at 6).
  const handleImport = (imported) => {
    const next = emptyTeam();
    imported.forEach((s, i) => { if (i < 6) next[i] = normalizeSlot(s); });
    setSlots(next);
  };

  return (
    <div className="container stack-lg">
      <div className="row-between">
        <button onClick={onCancel} className="back-link"><ChevronLeft size={16} /> Back</button>
        <div className="row gap-2">
          {editing && onDelete && <Btn variant="danger" onClick={onDelete}><Trash2 size={14} /> Delete</Btn>}
          <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
          <Btn variant="primary" onClick={handleSave} disabled={!canSave}>
            {editing ? "Update Team" : "Save Team"}
          </Btn>
        </div>
      </div>

      <header>
        <div className="eyebrow">Team // {editing ? "Edit" : "New"}</div>
        <h1 className="serif page-title">Team Builder</h1>
      </header>

      <label className="field">
        <span className="label-xs">Team Name</span>
        <input value={name} onChange={e => setName(e.target.value)}
          placeholder="e.g. Sun HO, Rain Balance, Hyper Offense…"
          className="input input-lg" />
      </label>

      <div className="row-between" style={{ alignItems: "center" }}>
        <div className="label-xs">Build by hand — or paste a team:</div>
        <Btn variant="outline" onClick={() => setImportOpen(true)}>
          <ClipboardPaste size={14} /> Import PokéPaste
        </Btn>
      </div>

      <TeamBuilder team={slots} setTeam={setSlots} label="Composition" />

      <p className="hint">
        Tap the <Sparkles size={12} style={{ verticalAlign: "middle" }} /> on each slot to toggle that
        Pokémon as shiny. Items and shiny flags save as defaults — when you log a battle with this team
        they pre-fill but can be overridden per-match.
      </p>

      <PokepasteImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={handleImport}
      />
    </div>
  );
};

/* ============================================================================
 * NEW / EDIT BATTLE
 * ========================================================================== */
const NewBattleView = ({ team, onSave, onCancel, editing }) => {
  const initialMyTeam = editing?.myTeam
    ?? team.slots.map(normalizeSlot);

  const [myTeam, setMyTeam] = useState(initialMyTeam.map(normalizeSlot));
  const [opponentTeam, setOpponentTeam] = useState((editing?.opponentTeam ?? emptyTeam()).map(normalizeSlot));
  const [brought, setBrought] = useState(editing?.brought ?? []);
  const [leads, setLeads] = useState(editing?.leads ?? []);
  const [seen, setSeen] = useState(editing?.seen ?? []);
  const [oppLeads, setOppLeads] = useState(editing?.oppLeads ?? []);
  const [result, setResult] = useState(editing?.result ?? null);
  const [notes, setNotes] = useState(editing?.notes ?? "");
  const [opponentName, setOpponentName] = useState(editing?.opponentName ?? "");
  const [date, setDate] = useState(editing?.date ?? new Date().toISOString().slice(0, 10));

  useEffect(() => { setBrought(prev => prev.filter(i => myTeam[i]?.pokemonSlug)); }, [myTeam]);
  useEffect(() => { setLeads(prev => prev.filter(i => brought.includes(i))); }, [brought]);
  useEffect(() => { setSeen(prev => prev.filter(s => opponentTeam[s.index]?.pokemonSlug)); }, [opponentTeam]);
  useEffect(() => { setOppLeads(prev => prev.filter(i => seen.some(s => s.index === i))); }, [seen]);

  const canSave = result !== null && myTeam.some(s => s.pokemonSlug);
  const handleSave = () => {
    if (!canSave) return;
    onSave({
      id: editing?.id ?? crypto.randomUUID(),
      teamId: team.id,
      createdAt: editing?.createdAt ?? Date.now(),
      date, opponentName,
      myTeam: myTeam.map(normalizeSlot),
      opponentTeam: opponentTeam.map(normalizeSlot),
      brought, leads,
      seen, oppLeads,
      result, notes,
    });
  };

  const seenIdxs = seen.map(s => s.index);

  return (
    <div className="container stack-lg">
      <div className="row-between">
        <button onClick={onCancel} className="back-link"><ChevronLeft size={16} /> Back</button>
        <div className="row gap-2">
          <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
          <Btn variant="primary" onClick={handleSave} disabled={!canSave}>
            {editing ? "Update Battle" : "Save Battle"}
          </Btn>
        </div>
      </div>

      <header>
        <div className="eyebrow">Battle // {editing ? "Edit" : "New"}</div>
        <h1 className="serif page-title">{team.name}</h1>
      </header>

      <div className="meta-grid">
        <label className="field">
          <span className="label-xs">Date</span>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input mono-input" />
        </label>
        <label className="field field-wide">
          <span className="label-xs">Opponent (optional)</span>
          <input value={opponentName} onChange={e => setOpponentName(e.target.value)}
            placeholder="Username, tag, or nickname" className="input" />
        </label>
      </div>

      <section>
        <TeamBuilder team={myTeam} setTeam={setMyTeam} label="Your Team (this match)" />
        <p className="hint">
          Items + shiny flags pre-fill from <span className="hint-hi">{team.name}</span>'s defaults. Edits affect this battle only.
        </p>
      </section>

      <section>
        <TeamBuilder team={opponentTeam} setTeam={setOpponentTeam} label="Opponent's Team" />
      </section>

      <div className="section-divider">
        <div className="eyebrow">Match Summary</div>
        <h2 className="serif section-title">What Actually Happened</h2>
        <div className="stack">
          <BroughtSelector team={myTeam} brought={brought} setBrought={setBrought} label="You Brought" />
          <LeadsSelector team={myTeam} pool={brought} leads={leads} setLeads={setLeads}
            label="Your Leads (2 in front)" />
          <OpponentSeenSelector team={opponentTeam} seen={seen} setSeen={setSeen} />
          <LeadsSelector team={opponentTeam} pool={seenIdxs} leads={oppLeads} setLeads={setOppLeads}
            label="Opponent's Leads (2 in front)" />
        </div>
      </div>

      <div>
        <h2 className="serif section-title">Result</h2>
        <div className="result-row">
          <button onClick={() => setResult("win")}
            className={`result-btn ${result === "win" ? "result-btn-win-on" : ""}`}>
            <Trophy size={24} />
            <span className="btn-label">Win</span>
          </button>
          <button onClick={() => setResult("loss")}
            className={`result-btn ${result === "loss" ? "result-btn-loss-on" : ""}`}>
            <Skull size={24} />
            <span className="btn-label">Loss</span>
          </button>
        </div>
      </div>

      <label className="field">
        <span className="label-xs">Notes</span>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4}
          placeholder="Lead, key turns, read misses, lessons…"
          className="input textarea" />
      </label>

      <div className="row-right gap-2 pb-8">
        <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
        <Btn variant="primary" onClick={handleSave} disabled={!canSave}>
          {editing ? "Update Battle" : "Save Battle"}
        </Btn>
      </div>
    </div>
  );
};

/* ============================================================================
 * BATTLE DETAIL
 * ========================================================================== */
const BattleDetailView = ({ battle, team, onBack, onEdit, onDelete }) => {
  const broughtSet = new Set(battle.brought);
  const leadsSet = new Set(battle.leads ?? []);
  const seenSet = new Set(battle.seen.map(s => s.index));
  const seenMap = Object.fromEntries(battle.seen.map(s => [s.index, s]));
  const oppLeadsSet = new Set(battle.oppLeads ?? []);

  return (
    <div className="container stack-lg">
      <div className="row-between">
        <button onClick={onBack} className="back-link"><ChevronLeft size={16} /> Back</button>
        <div className="row gap-2">
          <Btn variant="outline" onClick={onEdit}><Edit3 size={14} /> Edit</Btn>
          <Btn variant="danger" onClick={onDelete}><Trash2 size={14} /> Delete</Btn>
        </div>
      </div>

      <header>
        <div className="eyebrow">Battle // Review</div>
        <div className="result-header">
          <h1 className={`serif page-title ${battle.result === "win" ? "accent-emerald" : "accent-red"}`}>
            {battle.result === "win" ? "Victory" : "Defeat"}
          </h1>
          {team && <span className="muted">using {team.name}</span>}
          {battle.opponentName && <span className="muted">vs {battle.opponentName}</span>}
          <span className="muted right"><Calendar size={12} /> {battle.date}</span>
        </div>
      </header>

      <section>
        <h2 className="serif section-title">
          Your Team <span className="label-xs">brought = red · LEAD = front-line</span>
        </h2>
        <div className="team-grid">
          {battle.myTeam.filter(s => s.pokemonSlug).map((slot, idx) => {
            const origIdx = battle.myTeam.findIndex(s => s === slot);
            const poke = POKEMON_BY_SLUG[slot.pokemonSlug];
            const wasBrought = broughtSet.has(origIdx);
            const wasLead = leadsSet.has(origIdx);
            return (
              <div key={idx} className={`poke-card ${wasLead ? "poke-card-lead-on" : wasBrought ? "poke-card-on" : "poke-card-dim"}`}>
                {wasLead && <div className="lead-badge">LEAD</div>}
                <div className="poke-img-row"><PokeImage slug={poke.slug} size={72} shiny={slot.shiny} /></div>
                <div className="dex-num">#{String(poke.dex).padStart(4, "0")}</div>
                <div className="poke-name">{poke.name}{slot.shiny && <span className="shiny-star"> ✨</span>}</div>
                {slot.item && (
                  <div className="poke-item">
                    <ItemIcon name={slot.item} size={12} /> {slot.item}
                  </div>
                )}
                {wasBrought && !wasLead && <div className="poke-stamp">Brought</div>}
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="serif section-title">
          Opponent's Team <span className="label-xs">seen = red · ✓ = item revealed · LEAD = front-line</span>
        </h2>
        <div className="team-grid">
          {battle.opponentTeam.filter(s => s.pokemonSlug).map((slot) => {
            const origIdx = battle.opponentTeam.findIndex(s => s === slot);
            const poke = POKEMON_BY_SLUG[slot.pokemonSlug];
            const wasSeen = seenSet.has(origIdx);
            const wasLead = oppLeadsSet.has(origIdx);
            const seenInfo = seenMap[origIdx];
            return (
              <div key={origIdx} className={`poke-card ${wasLead ? "poke-card-lead-on" : wasSeen ? "poke-card-on" : "poke-card-dim"}`}>
                {wasLead && <div className="lead-badge">LEAD</div>}
                <div className="poke-img-row"><PokeImage slug={poke.slug} size={72} shiny={slot.shiny} /></div>
                <div className="dex-num">#{String(poke.dex).padStart(4, "0")}</div>
                <div className="poke-name">{poke.name}{slot.shiny && <span className="shiny-star"> ✨</span>}</div>
                {slot.item && (
                  <div className={`poke-item ${seenInfo?.itemRevealed ? "accent-emerald" : ""}`}>
                    <ItemIcon name={slot.item} size={12} />{" "}
                    {seenInfo?.itemRevealed ? "✓ " : ""}{slot.item}
                  </div>
                )}
                {wasSeen && !wasLead && <div className="poke-stamp">Seen</div>}
              </div>
            );
          })}
        </div>
      </section>

      {battle.notes && (
        <section>
          <h2 className="serif section-title">Notes</h2>
          <p className="notes-box">{battle.notes}</p>
        </section>
      )}
    </div>
  );
};

/* ============================================================================
 * STATS COMPUTATION
 * ========================================================================== */
const ensureEntry = (obj, slug) => (obj[slug] ||= { count: 0, wins: 0, losses: 0 });
const toSorted = (obj) => Object.entries(obj).map(([slug, d]) => ({ slug, ...d }))
  .sort((a, b) => b.count - a.count || a.slug.localeCompare(b.slug));

const computeTeamStats = (teamBattles) => {
  const wins = teamBattles.filter(b => b.result === "win").length;
  const losses = teamBattles.filter(b => b.result === "loss").length;
  const total = teamBattles.length;
  const brought = {}, preview = {}, myBrought = {}, oppLeads = {};
  for (const b of teamBattles) {
    for (const s of b.seen) {
      const slot = b.opponentTeam[s.index];
      if (!slot?.pokemonSlug) continue;
      const e = ensureEntry(brought, slot.pokemonSlug);
      e.count++; if (b.result === "win") e.wins++; else e.losses++;
    }
    for (const idx of (b.oppLeads ?? [])) {
      const slot = b.opponentTeam[idx];
      if (!slot?.pokemonSlug) continue;
      const e = ensureEntry(oppLeads, slot.pokemonSlug);
      e.count++; if (b.result === "win") e.wins++; else e.losses++;
    }
    for (const slot of b.opponentTeam) {
      if (!slot.pokemonSlug) continue;
      preview[slot.pokemonSlug] = (preview[slot.pokemonSlug] || 0) + 1;
    }
    for (const i of b.brought) {
      const slot = b.myTeam[i];
      if (!slot?.pokemonSlug) continue;
      const e = ensureEntry(myBrought, slot.pokemonSlug);
      e.count++; if (b.result === "win") e.wins++; else e.losses++;
    }
  }
  return {
    total, wins, losses,
    winRate: total ? wins / total : 0,
    opponentBrought: toSorted(brought),
    opponentLeads: toSorted(oppLeads),
    opponentPreview: Object.entries(preview).map(([slug, count]) => ({ slug, count }))
      .sort((a, b) => b.count - a.count),
    myBrought: toSorted(myBrought),
  };
};

const computeGlobalStats = (battles) => {
  const yourUsed = {};    // your brought, all battles
  const beatYou = {};     // opp pokemon seen in your losses
  const youBeat = {};     // opp pokemon seen in your wins
  const oppLeads = {};    // opp leads
  const yourLeads = {};   // your leads

  for (const b of battles) {
    const isWin = b.result === "win";

    for (const i of (b.brought || [])) {
      const slot = b.myTeam[i];
      if (!slot?.pokemonSlug) continue;
      const e = ensureEntry(yourUsed, slot.pokemonSlug);
      e.count++; if (isWin) e.wins++; else e.losses++;
    }
    for (const i of (b.leads || [])) {
      const slot = b.myTeam[i];
      if (!slot?.pokemonSlug) continue;
      const e = ensureEntry(yourLeads, slot.pokemonSlug);
      e.count++; if (isWin) e.wins++; else e.losses++;
    }

    for (const s of (b.seen || [])) {
      const slot = b.opponentTeam[s.index];
      if (!slot?.pokemonSlug) continue;
      const bucket = isWin ? youBeat : beatYou;
      const e = ensureEntry(bucket, slot.pokemonSlug);
      e.count++;
      if (isWin) e.wins++; else e.losses++;
    }
    for (const i of (b.oppLeads || [])) {
      const slot = b.opponentTeam[i];
      if (!slot?.pokemonSlug) continue;
      const e = ensureEntry(oppLeads, slot.pokemonSlug);
      e.count++; if (isWin) e.wins++; else e.losses++;
    }
  }

  return {
    totalBattles: battles.length,
    yourUsed: toSorted(yourUsed),
    yourLeads: toSorted(yourLeads),
    beatYou: toSorted(beatYou),
    youBeat: toSorted(youBeat),
    oppLeads: toSorted(oppLeads),
  };
};

/* ============================================================================
 * SCOUTING ROW
 * ========================================================================== */
const ScoutingRow = ({ entry, total, showWinRate = true }) => {
  const poke = POKEMON_BY_SLUG[entry.slug];
  const freq = total ? Math.round((entry.count / total) * 100) : 0;
  const wr = showWinRate && entry.count ? Math.round((entry.wins / entry.count) * 100) : null;
  const wrClass = wr === null ? "" : wr >= 60 ? "accent-emerald" : wr <= 40 ? "accent-red" : "muted";
  return (
    <div className="scout-row">
      <PokeImage slug={entry.slug} size={40} />
      <div className="scout-main">
        <div className="scout-name">{poke?.name ?? entry.slug}</div>
        <div className="label-xs">#{String(poke?.dex ?? 0).padStart(4, "0")}</div>
      </div>
      <div className="scout-right">
        <div className="scout-count">
          {entry.count}<span className="muted-sm"> × · {freq}%</span>
        </div>
        {wr !== null && (
          <div className={`scout-wr mono ${wrClass}`}>
            {entry.wins}W-{entry.losses}L · {wr}% WR
          </div>
        )}
      </div>
    </div>
  );
};

/* ============================================================================
 * GLOBAL STATS VIEW
 * ========================================================================== */
const GlobalStatsView = ({ battles, teams, onBack }) => {
  const stats = useMemo(() => computeGlobalStats(battles), [battles]);

  if (battles.length === 0) {
    return (
      <div className="container stack-lg">
        <div className="row-between">
          <button onClick={onBack} className="back-link"><ChevronLeft size={16} /> Back</button>
        </div>
        <header>
          <div className="eyebrow">Global // Stats</div>
          <h1 className="serif page-title">All Battles</h1>
        </header>
        <div className="empty-state">
          <BarChart3 size={40} className="empty-icon" />
          <h3 className="serif empty-title">No battles logged yet.</h3>
          <p className="muted-sm">Log some matches to see global patterns.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container stack-lg">
      <div className="row-between">
        <button onClick={onBack} className="back-link"><ChevronLeft size={16} /> Back</button>
        <Btn variant="outline" onClick={() => exportBattles(battles, teams)}>
          <Download size={14} /> Export XLSX
        </Btn>
      </div>

      <header>
        <div className="eyebrow">Global // Stats</div>
        <h1 className="serif page-title">All Battles</h1>
        <p className="muted-sm mt-2">{stats.totalBattles} battles tracked across {teams.length} team{teams.length !== 1 ? "s" : ""}.</p>
      </header>

      <section className="scout-grid">
        <div className="panel">
          <div className="panel-head"><BarChart3 size={14} className="accent-red-icon" />
            <h2 className="serif panel-title">Pokémon You Used Most</h2></div>
          <p className="label-xs panel-sub">Your brought Pokémon · WR when each was in your 4</p>
          <div className="divided">
            {stats.yourUsed.slice(0, 20).map(e => (
              <ScoutingRow key={e.slug} entry={e} total={stats.totalBattles} />
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head"><Sparkles size={14} className="accent-red-icon" />
            <h2 className="serif panel-title">Your Most Common Leads</h2></div>
          <p className="label-xs panel-sub">Your own front-line Pokémon · WR when leading with each</p>
          <div className="divided">
            {stats.yourLeads.slice(0, 20).map(e => (
              <ScoutingRow key={e.slug} entry={e} total={stats.totalBattles} />
            ))}
            {stats.yourLeads.length === 0 && <div className="muted-sm pad">No leads recorded yet.</div>}
          </div>
        </div>
      </section>

      <section className="scout-grid">
        <div className="panel">
          <div className="panel-head"><TrendingDown size={14} className="accent-red-icon" />
            <h2 className="serif panel-title">Pokémon That Beat You</h2></div>
          <p className="label-xs panel-sub">Opponent Pokémon seen in battles you <span className="accent-red">lost</span></p>
          <div className="divided">
            {stats.beatYou.slice(0, 20).map(e => (
              <ScoutingRow key={e.slug} entry={e} total={stats.totalBattles} showWinRate={false} />
            ))}
            {stats.beatYou.length === 0 && <div className="muted-sm pad">No losses recorded.</div>}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head"><TrendingUp size={14} className="accent-red-icon" />
            <h2 className="serif panel-title">Pokémon You Beat</h2></div>
          <p className="label-xs panel-sub">Opponent Pokémon seen in battles you <span className="accent-emerald">won</span></p>
          <div className="divided">
            {stats.youBeat.slice(0, 20).map(e => (
              <ScoutingRow key={e.slug} entry={e} total={stats.totalBattles} showWinRate={false} />
            ))}
            {stats.youBeat.length === 0 && <div className="muted-sm pad">No wins recorded.</div>}
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head"><Target size={14} className="accent-red-icon" />
          <h2 className="serif panel-title">Opponent's Most Common Leads</h2></div>
        <p className="label-xs panel-sub">Opponent front-line Pokémon across all battles · your WR against each</p>
        <div className="divided">
          {stats.oppLeads.slice(0, 20).map(e => (
            <ScoutingRow key={e.slug} entry={e} total={stats.totalBattles} />
          ))}
          {stats.oppLeads.length === 0 && <div className="muted-sm pad">No leads recorded yet.</div>}
        </div>
      </section>
    </div>
  );
};

/* ============================================================================
 * TEAM DETAIL — scouting dashboard
 * ========================================================================== */
const TeamDetailView = ({ team, battles, onBack, onEdit, onNewBattle, onOpenBattle }) => {
  const teamBattles = useMemo(() => battles.filter(b => b.teamId === team.id), [battles, team.id]);
  const stats = useMemo(() => computeTeamStats(teamBattles), [teamBattles]);
  const sortedBattles = useMemo(
    () => [...teamBattles].sort((a, b) =>
      (b.date + String(b.createdAt)).localeCompare(a.date + String(a.createdAt))),
    [teamBattles]
  );

  return (
    <div className="container stack-lg">
      <div className="row-between">
        <button onClick={onBack} className="back-link"><ChevronLeft size={16} /> Teams</button>
        <div className="row gap-2">
          <Btn variant="outline" onClick={onEdit}><Edit3 size={14} /> Edit Team</Btn>
          <Btn variant="primary" onClick={onNewBattle}><Plus size={14} /> Log Battle</Btn>
        </div>
      </div>

      <header>
        <div className="eyebrow">Team // Dashboard</div>
        <h1 className="serif page-title">{team.name}</h1>
      </header>

      <section>
        <div className="team-grid">
          {team.slots.filter(s => s.pokemonSlug).map((slot, i) => {
            const poke = POKEMON_BY_SLUG[slot.pokemonSlug];
            return (
              <div key={i} className="poke-card poke-card-dim">
                <div className="poke-img-row"><PokeImage slug={poke.slug} size={72} shiny={slot.shiny} /></div>
                <div className="dex-num">#{String(poke.dex).padStart(4, "0")}</div>
                <div className="poke-name">{poke.name}{slot.shiny && <span className="shiny-star"> ✨</span>}</div>
                {slot.item && (
                  <div className="poke-item">
                    <ItemIcon name={slot.item} size={12} /> {slot.item}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="stats-grid">
        <StatCard label="Battles" value={stats.total} />
        <StatCard label="Wins" value={stats.wins} accent="emerald" />
        <StatCard label="Losses" value={stats.losses} accent="red" />
        <StatCard label="Win Rate" value={stats.total ? `${Math.round(stats.winRate * 100)}%` : "—"} />
      </section>

      {stats.total === 0 ? (
        <div className="empty-state">
          <Swords size={40} className="empty-icon" />
          <h3 className="serif empty-title">No matches logged yet.</h3>
          <p className="muted-sm">Log your first battle to unlock scouting stats.</p>
          <Btn variant="primary" className="mt-6" onClick={onNewBattle}><Plus size={16} /> Log Battle</Btn>
        </div>
      ) : (
        <>
          <section className="scout-grid">
            <div className="panel">
              <div className="panel-head"><Target size={14} className="accent-red-icon" />
                <h2 className="serif panel-title">Most Brought Against You</h2></div>
              <p className="label-xs panel-sub">Opponent Pokémon in their 4 · your win rate vs each</p>
              <div className="divided">
                {stats.opponentBrought.slice(0, 10).map(e => (
                  <ScoutingRow key={e.slug} entry={e} total={stats.total} />
                ))}
                {stats.opponentBrought.length === 0 && <div className="muted-sm pad">No seen opponent Pokémon yet.</div>}
              </div>
            </div>
            <div className="panel">
              <div className="panel-head"><Sparkles size={14} className="accent-red-icon" />
                <h2 className="serif panel-title">Most Common Leads</h2></div>
              <p className="label-xs panel-sub">Opponent Pokémon in their front 2 · WR vs each</p>
              <div className="divided">
                {stats.opponentLeads.slice(0, 10).map(e => (
                  <ScoutingRow key={e.slug} entry={e} total={stats.total} />
                ))}
                {stats.opponentLeads.length === 0 && <div className="muted-sm pad">No leads recorded yet.</div>}
              </div>
            </div>
          </section>

          <section className="scout-grid">
            <div className="panel">
              <div className="panel-head"><Eye size={14} className="accent-red-icon" />
                <h2 className="serif panel-title">Most Seen in Preview</h2></div>
              <p className="label-xs panel-sub">Pokémon on opponent teams you've faced (full 6)</p>
              <div className="divided">
                {stats.opponentPreview.slice(0, 10).map(e => (
                  <ScoutingRow key={e.slug} entry={e} total={stats.total} showWinRate={false} />
                ))}
              </div>
            </div>
            <div className="panel">
              <div className="panel-head"><BarChart3 size={14} className="accent-red-icon" />
                <h2 className="serif panel-title">Your Bring Frequency</h2></div>
              <p className="label-xs panel-sub">Which of your 6 you picked most · WR when each was in your 4</p>
              <div className="divided">
                {stats.myBrought.map(e => (
                  <ScoutingRow key={e.slug} entry={e} total={stats.total} />
                ))}
              </div>
            </div>
          </section>

          <section>
            <h2 className="serif section-title">Battle History</h2>
            <div className="stack-sm">
              {sortedBattles.map(b => (
                <BattleRow key={b.id} battle={b} onOpen={() => onOpenBattle(b.id)} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

/* ============================================================================
 * BATTLE ROW
 * ========================================================================== */
const BattleRow = ({ battle, onOpen }) => {
  const leadsSet = new Set(battle.leads ?? []);
  const myEntries = battle.myTeam.map((s, i) => ({ s, i }))
    .filter(({ s, i }) => s.pokemonSlug && battle.brought.includes(i));
  const myLeads = myEntries.filter(x => leadsSet.has(x.i));
  const myBack = myEntries.filter(x => !leadsSet.has(x.i));

  const oppLeadsSet = new Set(battle.oppLeads ?? []);
  const theirEntries = battle.opponentTeam.map((s, i) => ({ s, i }))
    .filter(({ s, i }) => s.pokemonSlug && battle.seen.some(x => x.index === i));
  const theirLeads = theirEntries.filter(x => oppLeadsSet.has(x.i));
  const theirBack = theirEntries.filter(x => !oppLeadsSet.has(x.i));

  return (
    <button onClick={onOpen} className="battle-row">
      <div className={`result-badge ${battle.result === "win" ? "result-badge-win" : "result-badge-loss"}`}>
        {battle.result === "win" ? "W" : "L"}
      </div>
      <div className="battle-row-side">
        <div className="battle-row-leads">
          {myLeads.map(({ s }, i) => (<PokeImage key={`L${i}`} slug={s.pokemonSlug} size={40} shiny={s.shiny} />))}
        </div>
        <div className="battle-row-back">
          {myBack.map(({ s }, i) => (<PokeImage key={`B${i}`} slug={s.pokemonSlug} size={28} shiny={s.shiny} />))}
        </div>
      </div>
      <div className="muted-sm vs">vs</div>
      <div className="battle-row-side">
        <div className="battle-row-leads">
          {theirLeads.map(({ s }, i) => (<PokeImage key={`L${i}`} slug={s.pokemonSlug} size={40} shiny={s.shiny} />))}
        </div>
        <div className="battle-row-back">
          {theirBack.map(({ s }, i) => (<PokeImage key={`B${i}`} slug={s.pokemonSlug} size={28} shiny={s.shiny} />))}
        </div>
      </div>
      <div className="battle-row-meta">
        {battle.opponentName && <span>{battle.opponentName}</span>}
        <span>{battle.date}</span>
      </div>
    </button>
  );
};

/* ============================================================================
 * TEAMS HOME
 * ========================================================================== */
const TeamsHomeView = ({ teams, battles, onNewTeam, onOpenTeam, onOpenStats, onExport }) => {
  const teamRows = useMemo(() => {
    return teams.map(t => {
      const tb = battles.filter(b => b.teamId === t.id);
      const wins = tb.filter(b => b.result === "win").length;
      const losses = tb.filter(b => b.result === "loss").length;
      const total = tb.length;
      const lastUsed = tb.reduce((m, b) => Math.max(m, b.createdAt || 0), 0);
      return { team: t, wins, losses, total, lastUsed, winRate: total ? wins / total : 0 };
    }).sort((a, b) => (b.lastUsed || b.team.updatedAt) - (a.lastUsed || a.team.updatedAt));
  }, [teams, battles]);

  const overall = useMemo(() => {
    const wins = battles.filter(b => b.result === "win").length;
    const losses = battles.filter(b => b.result === "loss").length;
    const total = wins + losses;
    return { wins, losses, total, wr: total ? Math.round((wins / total) * 100) : 0 };
  }, [battles]);

  return (
    <div className="container stack-lg pt-8">
      <header className="home-head">
        <div>
          <div className="eyebrow">Pokémon Champions</div>
          <h1 className="serif page-title home-title">Teams</h1>
          <p className="muted-sm mt-2">Track records, matchups, and scouting intel per team.</p>
        </div>
        <div className="row gap-2" style={{ alignItems: "center" }}>
          <Btn variant="outline" onClick={onOpenStats} disabled={battles.length === 0}>
            <BarChart3 size={14} /> Stats
          </Btn>
          <Btn variant="outline" onClick={onExport} disabled={battles.length === 0}>
            <Download size={14} /> Export XLSX
          </Btn>
          <Btn variant="primary" onClick={onNewTeam}>
            <Plus size={16} /> New Team
          </Btn>
        </div>
      </header>

      <div className="stats-grid">
        <StatCard label="Teams" value={teams.length} />
        <StatCard label="Total Battles" value={overall.total} />
        <StatCard label="Total Wins" value={overall.wins} accent="emerald" />
        <StatCard label="Overall WR" value={overall.total ? `${overall.wr}%` : "—"} />
      </div>

      {teamRows.length === 0 ? (
        <div className="empty-state">
          <Users size={40} className="empty-icon" />
          <h3 className="serif empty-title">No teams yet.</h3>
          <p className="muted-sm">Build your first team to start logging battles.</p>
          <Btn variant="primary" className="mt-6" onClick={onNewTeam}><Plus size={16} /> New Team</Btn>
        </div>
      ) : (
        <div className="stack-sm">
          <div className="label-xs pad-x">All Teams</div>
          {teamRows.map(({ team, wins, losses, total, winRate }) => {
            const wrClass = !total ? "muted" : winRate >= 0.6 ? "accent-emerald" : winRate <= 0.4 ? "accent-red" : "";
            return (
              <button key={team.id} onClick={() => onOpenTeam(team.id)} className="team-row">
                <div className="team-row-main">
                  <div className="serif team-row-title">{team.name}</div>
                  <div className="team-row-pokes">
                    {team.slots.filter(s => s.pokemonSlug).map((s, i) => (
                      <PokeImage key={i} slug={s.pokemonSlug} size={36} shiny={s.shiny} />
                    ))}
                  </div>
                </div>
                <div className="team-row-stats">
                  <div>
                    <div className="label-xs">Record</div>
                    <div className="mono">
                      <span className="accent-emerald">{wins}W</span>
                      <span className="muted"> · </span>
                      <span className="accent-red">{losses}L</span>
                    </div>
                  </div>
                  <div>
                    <div className="label-xs">Win Rate</div>
                    <div className={`mono ${wrClass}`}>
                      {total ? `${Math.round(winRate * 100)}%` : "—"}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ============================================================================
 * STYLES
 * ========================================================================== */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; }

:root {
  --bg: #0A0A0A;
  --panel: #111;
  --panel-2: rgba(24,24,27,0.4);
  --panel-3: rgba(24,24,27,0.3);
  --border: #27272a;
  --border-2: #3f3f46;
  --text: #f4f4f5;
  --text-2: #a1a1aa;
  --text-3: #71717a;
  --text-4: #52525b;
  --text-5: #3f3f46;
  --accent: #DC2626;
  --accent-hover: #B91C1C;
  --accent-dark: #7F1D1D;
  --accent-soft: rgba(220,38,38,0.1);
  --accent-softer: rgba(220,38,38,0.2);
  --accent-red-light: #FCA5A5;
  --emerald: #10b981;
  --emerald-light: #34d399;
  --emerald-soft: rgba(16,185,129,0.1);
  --emerald-dark: rgba(6,78,59,0.4);
  --emerald-border: #065f46;
  --shiny: #fbbf24;
  --shiny-hover: #f59e0b;
  --lead: #fbbf24;
  --lead-dark: #b45309;
  --lead-soft: rgba(251,191,36,0.1);
}

body, html, #root {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: 'DM Sans', sans-serif;
  min-height: 100vh;
}

.app {
  min-height: 100vh;
  background-image:
    linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
  background-size: 32px 32px;
}

.serif { font-family: 'Instrument Serif', serif; font-style: italic; font-weight: 400; }
.mono  { font-family: 'JetBrains Mono', monospace; }

.eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px; font-weight: 500;
  text-transform: uppercase; letter-spacing: 0.2em;
  color: var(--accent);
}

.label-xs {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  text-transform: uppercase; letter-spacing: 0.15em;
  color: var(--text-3);
}
.label-xs.dim { color: var(--text-5); }

.page-title { font-size: 48px; margin: 4px 0 0; color: var(--text); line-height: 1.05; }
.home-title { font-size: 64px; }
.section-title { font-size: 22px; margin: 0; color: var(--text); }
.modal-title { font-size: 18px; margin: 0; }
.empty-title { font-size: 26px; margin: 16px 0 4px; color: var(--text-2); }
.panel-title { font-size: 18px; margin: 0; }

.muted    { color: var(--text-3); font-family: 'JetBrains Mono', monospace; font-size: 13px; }
.muted-sm { color: var(--text-4); font-family: 'JetBrains Mono', monospace; font-size: 12px; }

.accent-emerald { color: var(--emerald-light); }
.accent-red     { color: var(--accent-red-light); }
.accent-red-icon { color: var(--accent); flex-shrink: 0; }

.shiny-star { color: var(--shiny); font-size: 0.85em; }

.container { max-width: 1152px; margin: 0 auto; padding: 24px 16px; }
@media (min-width: 640px) { .container { padding: 24px 24px; } }

.stack-sm > * + * { margin-top: 8px; }
.stack    > * + * { margin-top: 24px; }
.stack-lg > * + * { margin-top: 32px; }

.row { display: flex; align-items: center; flex-wrap: wrap; }
.row-between { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.row-right { display: flex; justify-content: flex-end; flex-wrap: wrap; }
.gap-2 { gap: 8px; }
.pad { padding: 16px; }
.pad-x { padding: 0 4px; }
.mt-2 { margin-top: 8px; }
.mt-6 { margin-top: 24px; }
.pb-8 { padding-bottom: 32px; }
.right { margin-left: auto; }

.back-link {
  display: inline-flex; align-items: center; gap: 4px;
  background: transparent; border: none; cursor: pointer;
  color: var(--text-2); font-family: 'JetBrains Mono', monospace;
  font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em;
  padding: 0;
}
.back-link:hover { color: var(--text); }

.btn {
  padding: 8px 14px; border-radius: 6px; cursor: pointer;
  font-family: 'JetBrains Mono', monospace; font-size: 13px;
  text-transform: uppercase; letter-spacing: 0.08em;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
  display: inline-flex; align-items: center; gap: 6px;
}
.btn-default { background: #27272a; color: var(--text); border: 1px solid var(--border-2); }
.btn-default:hover:not(.is-disabled) { background: #3f3f46; }
.btn-primary { background: var(--accent); color: #fff; border: 1px solid var(--accent); }
.btn-primary:hover:not(.is-disabled) { background: var(--accent-hover); }
.btn-ghost { background: transparent; color: var(--text-2); border: 1px solid transparent; }
.btn-ghost:hover:not(.is-disabled) { background: rgba(39,39,42,0.6); }
.btn-outline { background: transparent; color: var(--text); border: 1px solid var(--border-2); }
.btn-outline:hover:not(.is-disabled) { background: rgba(39,39,42,0.6); }
.btn-danger { background: transparent; color: #f87171; border: 1px solid rgba(127,29,29,0.6); }
.btn-danger:hover:not(.is-disabled) { background: rgba(69,10,10,0.4); }
.btn-lg { padding: 12px 18px; font-size: 14px; }
.btn.is-disabled { opacity: 0.4; cursor: not-allowed; }

.icon-btn {
  background: transparent; border: none; cursor: pointer;
  color: var(--text-3); padding: 4px;
}
.icon-btn:hover { color: var(--text); }

.field { display: flex; flex-direction: column; gap: 4px; }

.input {
  background: #18181b; border: 1px solid var(--border);
  border-radius: 6px; padding: 10px 12px;
  color: var(--text); font-size: 14px; font-family: inherit;
  outline: none; transition: border-color 0.15s;
}
.input:focus { border-color: var(--accent); }
.input-lg { padding: 12px 14px; font-size: 16px; }
.input-wrap { position: relative; }
.input-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-3); }
.input-with-icon { padding-left: 36px; width: 100%; }
.mono-input { font-family: 'JetBrains Mono', monospace; font-size: 13px; }
.textarea { font-family: 'JetBrains Mono', monospace; line-height: 1.6; resize: vertical; }

.stats-grid {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;
}
@media (min-width: 640px) { .stats-grid { grid-template-columns: repeat(4, 1fr); } }

.stat-card {
  background: var(--panel-2); border: 1px solid var(--border);
  border-radius: 6px; padding: 16px;
}
.stat-value {
  font-family: 'Instrument Serif', serif; font-style: italic;
  font-size: 40px; margin-top: 4px; color: var(--text);
}
.stat-value.accent-emerald { color: var(--emerald-light); }
.stat-value.accent-red { color: var(--accent-red-light); }

.section-head { display: flex; align-items: baseline; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }

.hint {
  font-family: 'JetBrains Mono', monospace; font-size: 12px;
  color: var(--text-4); line-height: 1.6;
}
.hint-hi { color: var(--text-2); }

.section-divider {
  border-top: 1px solid var(--border); padding-top: 24px;
}
.section-divider .eyebrow { margin-bottom: 4px; }
.section-divider .section-title { margin-bottom: 24px; }

.poke-placeholder {
  border-radius: 6px;
  background: rgba(39,39,42,0.5);
  display: flex; align-items: center; justify-content: center;
}
.poke-img {
  display: block; object-fit: contain; image-rendering: pixelated;
}

.spinner-center { display: flex; align-items: center; justify-content: center; min-height: 100vh; }
.spinner-lg {
  width: 28px; height: 28px;
  border: 3px solid var(--text-5); border-top-color: var(--accent);
  border-radius: 50%; animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.team-grid, .leads-grid {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;
}
@media (min-width: 640px) { .team-grid, .leads-grid { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 1024px) { .team-grid { grid-template-columns: repeat(6, 1fr); } }
@media (min-width: 1024px) { .leads-grid { grid-template-columns: repeat(4, 1fr); } }

.slot {
  background: var(--panel-2); border: 1px solid var(--border);
  border-radius: 6px; padding: 12px;
  display: flex; flex-direction: column; gap: 8px;
}
.slot-header { display: flex; align-items: center; justify-content: space-between; }
.slot-header-actions { display: flex; align-items: center; gap: 4px; }
.slot-clear {
  background: transparent; border: none; color: var(--text-4); cursor: pointer; padding: 2px;
  display: flex; align-items: center;
}
.slot-clear:hover { color: #f87171; }

.slot-shiny-btn {
  background: transparent; border: 1px solid transparent;
  color: var(--text-5); cursor: pointer; padding: 2px 4px;
  border-radius: 4px;
  display: flex; align-items: center;
  transition: color 0.15s, background 0.15s, border-color 0.15s;
}
.slot-shiny-btn:hover { color: var(--text-2); border-color: var(--border); }
.slot-shiny-btn.is-on {
  color: var(--shiny);
  background: rgba(251,191,36,0.1);
  border-color: var(--shiny);
}

.slot-pick {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  min-height: 100px;
  border: 1px dashed var(--border); border-radius: 6px;
  background: rgba(0,0,0,0.3); cursor: pointer;
  padding: 8px 4px; color: var(--text);
  transition: border-color 0.15s;
}
.slot-pick:hover { border-color: rgba(220,38,38,0.6); }

.slot-empty {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  color: var(--text-4);
}

.slot-item-btn {
  text-align: left;
  font-family: 'JetBrains Mono', monospace; font-size: 11px;
  background: #09090b; border: 1px solid var(--border);
  border-radius: 6px; padding: 6px 10px;
  color: var(--text-2); cursor: pointer;
  transition: border-color 0.15s;
  display: flex; align-items: center; gap: 6px;
}
.slot-item-btn:hover:not(:disabled) { border-color: var(--border-2); }
.slot-item-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.slot-item-label { color: var(--text-4); }
.slot-item-value { color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.item-icon {
  display: inline-block; image-rendering: pixelated;
  object-fit: contain; flex-shrink: 0; vertical-align: middle;
}

.dex-num {
  font-family: 'JetBrains Mono', monospace; font-size: 10px;
  color: var(--text-4); margin-top: 4px;
}
.poke-name {
  font-size: 12px; color: var(--text);
  text-align: center; line-height: 1.2; padding: 0 4px;
}

.poke-card {
  position: relative; padding: 8px;
  border-radius: 6px; border: 1px solid var(--border);
  background: var(--panel-2);
  display: flex; flex-direction: column; align-items: center;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  font-family: inherit; color: inherit;
}
.poke-card:hover { border-color: var(--border-2); }
.poke-card-on { border-color: var(--accent); background: var(--accent-soft); }
.poke-card-lead-on {
  border-color: var(--lead); background: var(--lead-soft);
  box-shadow: 0 0 0 1px var(--lead-dark);
}
.poke-card-dim { opacity: 0.6; }
.poke-card-body {
  display: flex; flex-direction: column; align-items: center;
  width: 100%; background: transparent; border: none;
  cursor: pointer; color: inherit; padding: 0;
}

.poke-card-check {
  position: absolute; top: 4px; right: 4px;
  width: 20px; height: 20px; border-radius: 50%;
  background: var(--accent);
  display: flex; align-items: center; justify-content: center;
  color: #fff;
}
.lead-badge {
  position: absolute; top: 4px; right: 4px;
  background: var(--lead); color: #1a1a1a;
  font-family: 'JetBrains Mono', monospace; font-size: 9px;
  font-weight: 600; letter-spacing: 0.1em;
  padding: 2px 6px; border-radius: 3px;
}
.poke-img-row { display: flex; justify-content: center; }

.poke-item {
  font-family: 'JetBrains Mono', monospace; font-size: 10px;
  color: var(--text-3); margin-top: 4px; text-align: center;
  max-width: 100%;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  display: inline-flex; align-items: center; gap: 3px; justify-content: center;
}
.poke-stamp {
  font-family: 'JetBrains Mono', monospace; font-size: 9px;
  color: var(--accent); text-align: center; margin-top: 4px;
  text-transform: uppercase; letter-spacing: 0.15em;
}
.poke-grid-empty {
  grid-column: 1 / -1;
  color: var(--text-4); font-family: 'JetBrains Mono', monospace; font-size: 13px;
  padding: 16px 0;
}

.item-reveal-badge {
  margin-top: 4px;
  font-family: 'JetBrains Mono', monospace; font-size: 9px;
  padding: 2px 6px; border-radius: 4px;
  background: #18181b; color: var(--text-3);
  border: 1px solid var(--border);
  cursor: pointer; transition: background 0.15s;
  display: inline-flex; align-items: center; gap: 3px;
}
.item-reveal-on {
  background: var(--emerald-dark); color: var(--emerald-light);
  border-color: var(--emerald-border);
}

.modal-overlay {
  position: fixed; inset: 0; z-index: 50;
  display: flex; align-items: center; justify-content: center;
  padding: 16px;
  background: rgba(0,0,0,0.8); backdrop-filter: blur(4px);
}
.modal-panel {
  background: var(--panel); border: 1px solid var(--border);
  border-radius: 10px;
  width: 100%; max-width: 768px;
  max-height: 85vh; display: flex; flex-direction: column;
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 20px; border-bottom: 1px solid var(--border);
}
.modal-body { flex: 1; overflow-y: auto; }

.picker-search {
  position: sticky; top: 0; background: var(--panel); z-index: 10;
  padding: 16px; border-bottom: 1px solid var(--border);
  display: flex; flex-direction: column; gap: 8px;
}
.picker-actions { display: flex; gap: 8px; }
.picker-grid {
  display: grid; gap: 8px; padding: 16px;
  grid-template-columns: repeat(3, 1fr);
}
@media (min-width: 640px) { .picker-grid { grid-template-columns: repeat(4, 1fr); } }
@media (min-width: 768px) { .picker-grid { grid-template-columns: repeat(5, 1fr); } }

.picker-item {
  background: rgba(24,24,27,0.6); border: 1px solid var(--border);
  border-radius: 6px; padding: 8px;
  display: flex; flex-direction: column; align-items: center;
  cursor: pointer; font: inherit; color: inherit;
  transition: background 0.15s, border-color 0.15s;
}
.picker-item:hover { background: #27272a; border-color: rgba(220,38,38,0.6); }
.picker-empty {
  text-align: center; color: var(--text-3); padding: 32px;
  font-family: 'JetBrains Mono', monospace; font-size: 13px;
}

.item-picker-body { padding: 16px; display: flex; flex-direction: column; gap: 20px; }
.item-cat-label {
  font-family: 'JetBrains Mono', monospace; font-size: 10px;
  text-transform: uppercase; letter-spacing: 0.2em;
  color: var(--accent); margin-bottom: 8px;
  padding-bottom: 4px; border-bottom: 1px solid var(--border);
}
.item-grid {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px;
}
@media (min-width: 640px) { .item-grid { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 768px) { .item-grid { grid-template-columns: repeat(4, 1fr); } }
.item-chip {
  padding: 8px 10px; border-radius: 6px;
  font-size: 12px; font-family: inherit;
  background: rgba(24,24,27,0.6); color: var(--text-2);
  border: 1px solid var(--border); cursor: pointer;
  transition: border-color 0.15s;
  display: flex; align-items: center; gap: 8px;
  text-align: left;
}
.item-chip:hover { border-color: var(--border-2); color: var(--text); }
.item-chip-active {
  background: var(--accent-softer); border-color: var(--accent); color: var(--accent-red-light);
}
.item-chip-name {
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;
}

/* PokéPaste import modal */
.import-body {
  padding: 16px;
  display: flex; flex-direction: column; gap: 16px;
}
.import-textarea {
  min-height: 260px; font-size: 12px;
  background: #09090b;
}
.import-preview {
  display: flex; flex-direction: column; gap: 10px;
}
.import-preview-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}
@media (min-width: 640px) { .import-preview-grid { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 768px) { .import-preview-grid { grid-template-columns: repeat(6, 1fr); } }
.import-preview-card {
  padding: 6px; border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--panel-2);
  display: flex; flex-direction: column; align-items: center; gap: 2px;
}
.import-errors {
  display: flex; flex-direction: column; gap: 4px;
  padding: 10px 12px; border-radius: 6px;
  background: rgba(127,29,29,0.15);
  border: 1px solid var(--accent-dark);
}
.import-error {
  font-family: 'JetBrains Mono', monospace; font-size: 11px;
  color: var(--accent-red-light);
}
.import-actions {
  display: flex; justify-content: flex-end; gap: 8px;
  padding-top: 4px;
  border-top: 1px solid var(--border);
}

.meta-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
@media (min-width: 640px) { .meta-grid { grid-template-columns: 1fr 2fr; } }

.result-row { display: flex; gap: 12px; }
.result-btn {
  flex: 1; padding: 16px;
  border-radius: 6px; border: 2px solid var(--border);
  background: var(--panel-2); color: var(--text-3);
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  cursor: pointer; font: inherit;
  transition: all 0.15s;
}
.result-btn:hover { border-color: var(--border-2); }
.result-btn .btn-label {
  font-family: 'JetBrains Mono', monospace; font-size: 13px;
  text-transform: uppercase; letter-spacing: 0.1em;
}
.result-btn-win-on {
  border-color: var(--emerald); background: var(--emerald-dark); color: var(--emerald-light);
}
.result-btn-loss-on {
  border-color: var(--accent); background: var(--accent-soft); color: var(--accent-red-light);
}

.battle-row {
  width: 100%; text-align: left;
  background: var(--panel-3); border: 1px solid var(--border);
  border-radius: 6px; padding: 12px;
  display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
  cursor: pointer; font: inherit; color: inherit;
  transition: background 0.15s, border-color 0.15s;
}
.battle-row:hover { background: rgba(24,24,27,0.6); border-color: var(--border-2); }

.result-badge {
  font-family: 'JetBrains Mono', monospace; font-size: 11px;
  text-transform: uppercase; letter-spacing: 0.15em;
  padding: 4px 8px; border-radius: 4px;
}
.result-badge-win {
  background: rgba(6,78,59,0.5); color: var(--emerald-light);
  border: 1px solid var(--emerald-border);
}
.result-badge-loss {
  background: var(--accent-soft); color: var(--accent-red-light);
  border: 1px solid var(--accent-dark);
}

.battle-row-side { display: flex; align-items: center; gap: 8px; }
.battle-row-leads {
  display: flex; align-items: center; gap: 2px;
  padding: 2px 4px; border-radius: 4px;
  background: var(--lead-soft);
  border: 1px solid var(--lead-dark);
}
.battle-row-back {
  display: flex; align-items: center; gap: 2px;
  opacity: 0.6;
}
.battle-row-meta {
  margin-left: auto;
  display: flex; align-items: center; gap: 12px;
  font-family: 'JetBrains Mono', monospace; font-size: 12px;
  color: var(--text-3);
}
.vs { padding: 0 4px; }

.result-header {
  display: flex; align-items: baseline; gap: 16px;
  margin-top: 4px; flex-wrap: wrap;
}

.notes-box {
  font-family: 'JetBrains Mono', monospace; font-size: 13px;
  color: var(--text-2); white-space: pre-wrap; line-height: 1.7;
  background: var(--panel-2); border: 1px solid var(--border);
  border-radius: 6px; padding: 16px; margin: 0;
}

.empty-state {
  text-align: center; padding: 64px 16px;
  border: 1px dashed var(--border); border-radius: 10px;
}
.empty-icon { color: var(--text-5); margin: 0 auto; }

.scout-grid {
  display: grid; grid-template-columns: 1fr; gap: 24px;
}
@media (min-width: 1024px) { .scout-grid { grid-template-columns: 1fr 1fr; } }

.panel {
  background: var(--panel-3); border: 1px solid var(--border);
  border-radius: 6px; padding: 16px;
}
.panel-head { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.panel-sub { margin: 0 0 12px; }

.divided > * + * { border-top: 1px solid rgba(24,24,27,1); }

.scout-row {
  display: flex; align-items: center; gap: 12px;
  padding: 8px; border-radius: 4px;
  transition: background 0.15s;
}
.scout-row:hover { background: var(--panel-2); }

.scout-main { flex: 1; min-width: 0; }
.scout-name { font-size: 14px; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.scout-right { text-align: right; }
.scout-count {
  font-family: 'JetBrains Mono', monospace; font-size: 14px; color: var(--text);
}
.scout-count .muted-sm { display: inline; margin-left: 4px; font-size: 12px; }
.scout-wr { font-size: 11px; }

.home-head {
  display: flex; align-items: flex-end; justify-content: space-between;
  gap: 16px; flex-wrap: wrap;
}

.team-row {
  width: 100%; text-align: left;
  background: var(--panel-3); border: 1px solid var(--border);
  border-radius: 6px; padding: 16px;
  display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
  cursor: pointer; font: inherit; color: inherit;
  transition: background 0.15s, border-color 0.15s;
}
.team-row:hover { background: rgba(24,24,27,0.6); border-color: var(--border-2); }

.team-row-main { flex: 1; min-width: 180px; }
.team-row-title { font-size: 28px; color: var(--text); }
.team-row-pokes { display: flex; align-items: center; gap: 4px; margin-top: 8px; flex-wrap: wrap; }

.team-row-stats { display: flex; align-items: center; gap: 24px; }
`;

/* ============================================================================
 * APP ROOT
 * ========================================================================== */
export default function ChampionsTracker() {
  const [teams, setTeams] = useState([]);
  const [battles, setBattles] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const [view, setView] = useState("home");
  const [openTeamId, setOpenTeamId] = useState(null);
  const [openBattleId, setOpenBattleId] = useState(null);

  useEffect(() => {
    Promise.all([safeGet(K_TEAMS, []), safeGet(K_BATTLES, [])]).then(([t, b]) => {
      const migrated = migrateIfNeeded(t, b);
      setTeams(migrated.teams);
      setBattles(migrated.battles);
      safeSet(K_TEAMS, migrated.teams);
      safeSet(K_BATTLES, migrated.battles);
      setLoaded(true);
    });
  }, []);

  const persistTeams = (next) => { setTeams(next); safeSet(K_TEAMS, next); };
  const persistBattles = (next) => { setBattles(next); safeSet(K_BATTLES, next); };

  const saveTeam = (team) => {
    const existing = teams.findIndex(t => t.id === team.id);
    const next = existing >= 0 ? teams.map(t => t.id === team.id ? team : t) : [...teams, team];
    persistTeams(next);
    setOpenTeamId(team.id);
    setView("team");
  };
  const deleteTeam = (id) => {
    if (!confirm("Delete this team? Battles logged with it will be kept but unlinked.")) return;
    persistTeams(teams.filter(t => t.id !== id));
    persistBattles(battles.map(b => b.teamId === id ? { ...b, teamId: null } : b));
    setOpenTeamId(null);
    setView("home");
  };

  const saveBattle = (battle) => {
    const existing = battles.findIndex(b => b.id === battle.id);
    const next = existing >= 0 ? battles.map(b => b.id === battle.id ? battle : b) : [...battles, battle];
    persistBattles(next);
    setOpenBattleId(battle.id);
    setView("battle");
  };
  const deleteBattle = (id) => {
    if (!confirm("Delete this battle? Can't be undone.")) return;
    persistBattles(battles.filter(b => b.id !== id));
    setOpenBattleId(null);
    setView("team");
  };

  const currentTeam = teams.find(t => t.id === openTeamId);
  const currentBattle = battles.find(b => b.id === openBattleId);
  const currentBattleTeam = currentBattle ? teams.find(t => t.id === currentBattle.teamId) : null;

  return (
    <>
      <style>{STYLES}</style>
      <div className="app">
        {!loaded ? (
          <div className="spinner-center"><div className="spinner-lg" /></div>
        ) : view === "home" ? (
          <TeamsHomeView teams={teams} battles={battles}
            onNewTeam={() => setView("new-team")}
            onOpenTeam={(id) => { setOpenTeamId(id); setView("team"); }}
            onOpenStats={() => setView("stats")}
            onExport={() => exportBattles(battles, teams)}
          />
        ) : view === "stats" ? (
          <GlobalStatsView battles={battles} teams={teams} onBack={() => setView("home")} />
        ) : view === "new-team" ? (
          <TeamEditorView onSave={saveTeam} onCancel={() => setView("home")} />
        ) : view === "edit-team" && currentTeam ? (
          <TeamEditorView editing={currentTeam} onSave={saveTeam}
            onCancel={() => setView("team")} onDelete={() => deleteTeam(currentTeam.id)} />
        ) : view === "team" && currentTeam ? (
          <TeamDetailView team={currentTeam} battles={battles}
            onBack={() => setView("home")}
            onEdit={() => setView("edit-team")}
            onNewBattle={() => setView("new-battle")}
            onOpenBattle={(id) => { setOpenBattleId(id); setView("battle"); }} />
        ) : view === "new-battle" && currentTeam ? (
          <NewBattleView team={currentTeam} onSave={saveBattle} onCancel={() => setView("team")} />
        ) : view === "edit-battle" && currentBattle && currentBattleTeam ? (
          <NewBattleView team={currentBattleTeam} editing={currentBattle}
            onSave={saveBattle} onCancel={() => setView("battle")} />
        ) : view === "battle" && currentBattle ? (
          <BattleDetailView battle={currentBattle} team={currentBattleTeam}
            onBack={() => {
              if (currentBattle.teamId) { setOpenTeamId(currentBattle.teamId); setView("team"); }
              else setView("home");
            }}
            onEdit={() => setView("edit-battle")}
            onDelete={() => deleteBattle(currentBattle.id)} />
        ) : (
          <div style={{ padding: 32, color: "#71717a", fontFamily: "'JetBrains Mono', monospace" }}>
            Nothing to show.{" "}
            <button onClick={() => setView("home")} style={{ color: "#DC2626", background: "none", border: "none", textDecoration: "underline", cursor: "pointer" }}>
              Back to home
            </button>
          </div>
        )}
      </div>
    </>
  );
}