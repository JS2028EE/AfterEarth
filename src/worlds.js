import * as THREE from 'three';

const palette={earth:0x26352b,verdantia:0x173d25,cryon:0xb9d7e8,aridion:0xc28b4b};
export const WORLD_SPECS={
  earth:{name:'Earth',biomes:['launch facility','overgrown outskirts','coastal ruins'],gravity:9.81,temperature:18},
  verdantia:{name:'Verdantia',biomes:['rainforest','river basin','fungal caverns'],gravity:10.2,temperature:27},
  cryon:{name:'Cryon',biomes:['glacial plain','ice mountains','frozen ocean'],gravity:8.4,temperature:-35},
  aridion:{name:'Aridion',biomes:['sand sea','ruined megacity','buried empire'],gravity:9.4,temperature:44}
};

function material(color){return new THREE.MeshStandardMaterial({color,roughness:.95,metalness:0});}
export function createPlanetEnvironment(scene,id='earth',seed=4){
  const spec=WORLD_SPECS[id]||WORLD_SPECS.earth;
  const group=new THREE.Group(); group.name=`world-${id}`;
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(420,420,32,32),material(palette[id]||palette.earth));
  ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; group.add(ground);
  const rng=mulberry(seed+id.length*101);
  for(let i=0;i<90;i++){
    const x=(rng()-.5)*360,z=(rng()-.5)*360,h=2+rng()*18,w=2+rng()*10;
    let color=id==='cryon'?0xd8edf5:id==='aridion'?0x8c5d35:id==='verdantia'?0x245b2b:0x34433a;
    const obj=new THREE.Mesh(new THREE.ConeGeometry(w,h, id==='verdantia'?7:6),material(color));
    obj.position.set(x,h/2,z); obj.castShadow=obj.receiveShadow=true; group.add(obj);
  }
  group.userData={id,spec}; scene.add(group); return group;
}
function mulberry(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
