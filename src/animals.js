export const SPECIES={
  verdantia:[['strider grazer','prey',18],['razorcat','predator',12],['sky manta','neutral',30],['mossback','prey',8]],
  cryon:[['whitehorn','prey',16],['frost crawler','predator',7],['ice wyvern','predator',24],['burrow seal','neutral',4]],
  aridion:[['dune runner','prey',14],['glass serpent','predator',9],['scavenger beetle','neutral',2],['sun hawk','predator',20]],
  earth:[['feral deer','prey',8],['wolf','predator',10],['crow','neutral',3]]
};
export class WildlifeManager{constructor(planet='earth'){this.planet=planet;this.entities=[]}spawn(count=12){const list=SPECIES[this.planet]||SPECIES.earth;for(let i=0;i<count;i++){const s=list[i%list.length];this.entities.push({species:s[0],role:s[1],speed:s[2],state:'roaming',energy:100})}return this.entities}update(dt){for(const e of this.entities){e.energy=Math.max(0,e.energy-dt*.01);if(e.energy<20)e.state='foraging';else if(e.state!=='flee')e.state='roaming'}}}
