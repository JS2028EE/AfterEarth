export const ITEMS={
  water:{name:'Purified Water',type:'consumable',value:{water:30}}, ration:{name:'Emergency Ration',type:'consumable',value:{food:25}}, medkit:{name:'Medkit',type:'consumable',value:{health:35}},
  scrap:{name:'Metal Scrap',type:'material'}, fiber:{name:'Plant Fiber',type:'material'}, crystal:{name:'Energy Crystal',type:'material'}, fuel:{name:'Rocket Fuel Cell',type:'ship'}, ammo:{name:'Rifle Ammunition',type:'ammo'}
};
export const RECIPES={bandage:{name:'Field Bandage',needs:{fiber:2},gives:{medkit:1}},fuelcell:{name:'Fuel Cell',needs:{scrap:3,crystal:1},gives:{fuel:1}},waterfilter:{name:'Water Filter',needs:{scrap:2,fiber:2},gives:{water:2}}};
export function consumeItem(id,survival){const item=ITEMS[id];if(!item?.value)return false;for(const [k,v] of Object.entries(item.value))survival[k]=Math.min(100,(survival[k]||0)+v);return true}
