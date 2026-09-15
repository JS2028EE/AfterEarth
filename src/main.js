import * as THREE from 'three';
import './style.css';
import {createRocket} from './rocket.js';
import {SurvivalSystem,InventorySystem,QuestSystem,ShipSystem} from './systems.js';
import {createPlanetEnvironment,WORLD_SPECS} from './worlds.js';
import {MISSIONS} from './missionData.js';
import {saveGame,loadGame} from './save.js';

const app=document.querySelector('#app');
app.innerHTML=`<div id="hud"><div class="brand">AFTEREARTH</div><div id="objective"></div><div id="stats"></div><div id="help">WASD move · Shift sprint · E interact · V third person · M map · L launch · R collect · F5/F9 save/load</div></div><div id="crosshair">+</div><div id="panel"></div>`;
const objective=document.querySelector('#objective'),stats=document.querySelector('#stats'),panel=document.querySelector('#panel');

const scene=new THREE.Scene();scene.background=new THREE.Color(0x101821);scene.fog=new THREE.FogExp2(0x13202a,.0032);
const camera=new THREE.PerspectiveCamera(68,innerWidth/innerHeight,.08,900);
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;app.appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xb8d7ff,0x182016,2.2));
const sun=new THREE.DirectionalLight(0xfff0d2,3.2);sun.position.set(-80,100,45);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-120;sun.shadow.camera.right=120;sun.shadow.camera.top=120;sun.shadow.camera.bottom=-120;scene.add(sun);

const survival=new SurvivalSystem(),inventory=new InventorySystem(),quests=new QuestSystem(),ship=new ShipSystem();
const keys={};let yaw=0,pitch=0,third=false,planet='earth',flightReady=false,launched=false,mapOpen=false;
let facility=new THREE.Group();facility.name='Horizon Launch Complex';scene.add(facility);
const obstacles=[];
function mat(c,rough=.8,metal=0){return new THREE.MeshStandardMaterial({color:c,roughness:rough,metalness:metal})}
function box(parent,x,y,z,sx,sy,sz,c,metal=0,rough=.75){const m=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),mat(c,rough,metal));m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;parent.add(m);return m}
function cyl(parent,x,y,z,r,h,c){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,20),mat(c,.7,.35));m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;parent.add(m);return m}
function buildFacility(){
  box(facility,0,-.35,0,190,.7,170,0x29343b,0,.95);
  // colossal hangar
  box(facility,0,15,-44,76,30,24,0x202a32,.55,.5);box(facility,0,3.2,-31,70,6,2.5,0x10181e,.7,.45);
  for(const x of[-35,35]){box(facility,x,18,-44,5,36,30,0x27343d,.55,.55);for(let y=5;y<35;y+=6)box(facility,x+(x<0?2:-2),y,-28,1.2,2,6,0x65757f,.75,.3)}
  // launch tower and gantry
  for(const x of[-18,18]){box(facility,x,20,-6,3,40,3,0x4a5962,.8,.35);box(facility,x/2,24,-12,30,2.5,3.2,0x53636c,.85,.3)}
  for(let y=6;y<36;y+=6) box(facility,0,y,-8,42,1,2.3,0x46555f,.85,.35);
  // control center
  box(facility,-66,9,10,34,18,28,0x26323a,.45,.55);box(facility,-66,15,-4,25,7,.5,0x7aa8bd,.35,.14);
  // radar, antennae and flood lights
  cyl(facility,-86,10,-22,5,1,0x596b75);cyl(facility,-86,13,-22,.35,7,0x778b95);box(facility,-89,18,-22,6,.35,1,0x9fb7c2,.8,.3);
  for(const p of[[-52,10,48],[52,10,48],[-52,10,-72],[52,10,-72]]){cyl(facility,p[0],p[1],p[2],.35,20,0x4d5961);const l=new THREE.PointLight(0xa8dfff,28,45);l.position.set(p[0],20,p[2]);facility.add(l)}
  // concrete barriers / roads
  for(const z of[-12,18,48]) box(facility,0,.8,z,120,1.6,2.5,0x4a555b,.1,.95);
  for(const x of[-45,-15,15,45]) box(facility,x,1.1,-4,2,2.2,85,0x566168,.1,.9);
  // mountains/terrain around perimeter: solid collision blockers
  for(const p of[[-115,18,-70,34,32],[115,22,-65,42,38],[-118,14,65,35,27],[118,18,64,45,34],[0,23,88,65,38]]){const m=new THREE.Mesh(new THREE.ConeGeometry(p[3],p[4],9),mat(0x36454b,.98,0));m.position.set(p[0],p[1],p[2]);m.castShadow=m.receiveShadow=true;facility.add(m);obstacles.push({x:p[0],z:p[2],r:p[3]*.75})}
}
buildFacility();

const player=new THREE.Object3D();player.position.set(0,1.7,72);scene.add(player);player.add(camera);
const rocket=createRocket(scene);rocket.position.set(0,5,-18);

function makeAnimal(species,x,z,size=1){
  const g=new THREE.Group();g.name=species;
  const body=mat(species.includes('wolf')||species.includes('cat')?0x3b3028:species.includes('deer')?0x786044:0x6f7a60,.95,0);
  const dark=mat(0x16191b,.85,.1);
  box(g,0,size*.65,0,size*2.4,size*1.05,size*1.1,body,0,.95);
  box(g,size*.95,size*.85,0,size*.85,size*.75,size*.9,body,0,.95);
  for(const px of[-.75,.75]) for(const pz of[-.35,.35]) box(g,px*size,.25*size,pz*size,.25*size,.7*size,.25*size,dark,0,.95);
  if(species==='strider grazer'||species==='feral deer'){for(const s of[-1,1]){const a=meshCone(g,s*.35*size,size*1.3,-.2,0.08*size,0.7*size,0xbda776)} }
  g.position.set(x,.02,z);g.scale.setScalar(.8+Math.random()*.5);g.userData={baseX:x,baseZ:z,phase:Math.random()*10,roam:.3+Math.random()*.5};scene.add(g);return g
}
function meshCone(parent,x,y,z,r,h,c){const m=new THREE.Mesh(new THREE.ConeGeometry(r,.75*h,8),mat(c,.9,0));m.position.set(x,y,z);m.rotation.z=x>0?.45:-.45;parent.add(m);return m}
const animals=[];
function spawnEarthWildlife(){const specs=[['feral deer',-46,53],['feral deer',-30,61],['wolf',52,46],['wolf',62,58],['crow',-67,38],['crow',70,26],['feral deer',32,66]];specs.forEach(s=>animals.push(makeAnimal(...s,.9)))}
spawnEarthWildlife();

function openMap(){mapOpen=!mapOpen;if(!mapOpen){panel.style.display='none';return}panel.innerHTML=`<div class="map"><h1>STAR MAP</h1><div class="planet unlocked">● EARTH — CURRENT</div><div class="planet ${flightReady?'unlocked':''}">● VERDANTIA — ${flightReady?'ROUTE READY':'LOCKED: board explorer'}</div><div class="planet locked">● CRYON — LOCKED</div><div class="planet locked">● ARIDION — LOCKED</div><p>Press M to close. Press E near the lander to calibrate navigation. Press L to launch.</p></div>`;panel.style.display='block'}
function save(){saveGame({planet,position:player.position.toArray(),inventory:[...inventory.items],flightReady,launched});panel.textContent='GAME SAVED';panel.style.display='block'}
function load(){const s=loadGame();if(!s)return;planet=s.planet;player.position.fromArray(s.position);flightReady=!!s.flightReady;launched=!!s.launched;if(planet==='verdantia')enterVerdantia(false);panel.textContent='GAME LOADED';panel.style.display='block'}
function enterVerdantia(announce=true){planet='verdantia';facility.visible=false;rocket.visible=false;scene.background.set(0x78a38c);scene.fog=new THREE.FogExp2(0x5d7e68,.0048);for(const a of animals)a.visible=false;const ground=createPlanetEnvironment(scene,'verdantia',91);ground.name='Verdantia_Environment';player.position.set(0,1.7,18);if(announce){objective.textContent='VERDANTIA — Reach the rainforest beacon';panel.innerHTML='<div class="arrival"><h1>VERDANTIA</h1><p>Atmosphere stable. Landing complete.</p><p>Press R near the landing zone to gather plant fiber.</p></div>';panel.style.display='block';setTimeout(()=>panel.style.display='none',4500)}}
objective.textContent=MISSIONS.facility_power.title+' — Reach the Horizon launch complex';
addEventListener('keydown',e=>{keys[e.code]=true;if(e.repeat)return;if(e.code==='KeyV')third=!third;if(e.code==='KeyM')openMap();if(e.code==='F5')save();if(e.code==='F9')load();if(e.code==='KeyE'&&planet==='earth'){const d=player.position.distanceTo(rocket.position);if(d<16){flightReady=true;objective.textContent='NAVIGATION CALIBRATED — Verdantia route ready. Press L to launch.';quests.complete('rocket_core');openMap();}else{inventory.add('scrap',1);objective.textContent='Collected 1 metal scrap. Reach the AE-01 Explorer lander.'}}if(e.code==='KeyL'&&planet==='earth'&&flightReady&&!launched){launched=true;openMap();setTimeout(()=>enterVerdantia(true),900)}if(e.code==='KeyR'&&planet==='verdantia'){inventory.add('fiber',1);objective.textContent='Collected plant fiber. Find the rainforest beacon.'}});addEventListener('keyup',e=>keys[e.code]=false);
renderer.domElement.onclick=()=>renderer.domElement.requestPointerLock();document.onmousemove=e=>{if(document.pointerLockElement){yaw-=e.movementX*.0022;pitch=THREE.MathUtils.clamp(pitch-e.movementY*.0022,-1.35,1.35)}};
function blocked(x,z){for(const o of obstacles){const dx=x-o.x,dz=z-o.z;if(dx*dx+dz*dz<o.r*o.r)return true}return false}
function animate(){requestAnimationFrame(animate);const dt=Math.min(.033,.016);const sprint=(keys.ShiftLeft||keys.ShiftRight)&&survival.stamina>1;const forward=new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw));const right=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));let ix=(keys.KeyD?1:0)-(keys.KeyA?1:0),iz=(keys.KeyS?1:0)-(keys.KeyW?1:0);const len=Math.hypot(ix,iz)||1;ix/=len;iz/=len;const target=new THREE.Vector3().addScaledVector(right,ix).addScaledVector(forward,iz);const max=sprint?9:5;const current=new THREE.Vector3(player.userData.vx||0,0,player.userData.vz||0);current.lerp(target.multiplyScalar(max),1-Math.pow(.001,dt));player.userData.vx=current.x;player.userData.vz=current.z;const nx=player.position.x+current.x*dt,nz=player.position.z+current.z*dt;if(!blocked(nx,nz)){player.position.x=nx;player.position.z=nz}survival.update(dt,sprint);camera.position.set(0,third?3.2:0,third?7.5:0);camera.rotation.set(pitch,yaw,0,'YXZ');camera.fov+=(68+(third?4:0)-camera.fov)*.08;camera.updateProjectionMatrix();animals.forEach(a=>{if(!a.visible)return;const t=performance.now()*.00015+a.userData.phase;a.position.x=a.userData.baseX+Math.sin(t)*8*a.userData.roam;a.position.z=a.userData.baseZ+Math.cos(t*.9)*6*a.userData.roam;a.rotation.y=Math.atan2(Math.cos(t),-Math.sin(t))});if(planet==='verdantia'&&keys.KeyR){}stats.textContent=`${planet.toUpperCase()} | HP ${survival.health|0} | STAMINA ${survival.stamina|0} | FOOD ${survival.food|0} | WATER ${survival.water|0} | HULL ${ship.hull|0}`;renderer.render(scene,camera)}animate();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});