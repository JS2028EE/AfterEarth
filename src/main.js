import * as THREE from 'three';
import './style.css';
import {createRocket} from './rocket.js';
import {SurvivalSystem,InventorySystem,QuestSystem,ShipSystem} from './systems.js';
import {createPlanetEnvironment,WORLD_SPECS} from './worlds.js';
import {MISSIONS} from './missionData.js';
import {saveGame,loadGame} from './save.js';

const app=document.querySelector('#app');
app.innerHTML=`<div id="hud"><div class="brand">AFTEREARTH</div><div id="objective"></div><div id="stats"></div><div id="help">WASD move · Shift sprint · E interact · V third person · M map · L launch · R collect · F5/F9 save/load · Click to look</div></div><div id="crosshair">+</div><div id="panel"></div><div id="enter">CLICK TO ENTER</div>`;
const objective=document.querySelector('#objective'),stats=document.querySelector('#stats'),panel=document.querySelector('#panel'),enter=document.querySelector('#enter');
const scene=new THREE.Scene();scene.background=new THREE.Color(0x9bb8c4);scene.fog=new THREE.Fog(0x9bb8c4,85,360);
const camera=new THREE.PerspectiveCamera(70,innerWidth/innerHeight,.05,1000);
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;app.appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xddeeff,0x334039,2.6));
const sun=new THREE.DirectionalLight(0xffefd2,3.8);sun.position.set(-90,140,70);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);scene.add(sun);
const survival=new SurvivalSystem(),inventory=new InventorySystem(),quests=new QuestSystem(),ship=new ShipSystem();
const keys={};let yaw=0,pitch=-0.05,third=false,planet='earth',flightReady=false,launched=false,mapOpen=false;let velocity=new THREE.Vector3();
const obstacles=[];
function mat(c,rough=.8,metal=0){return new THREE.MeshStandardMaterial({color:c,roughness:rough,metalness:metal})}
function box(parent,x,y,z,sx,sy,sz,c,metal=0,rough=.75,collide=false){const m=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),mat(c,rough,metal));m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;parent.add(m);if(collide)obstacles.push({x,z,rx:sx/2,rz:sz/2});return m}
function cyl(parent,x,y,z,r,h,c){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,20),mat(c,.7,.35));m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;parent.add(m);return m}
const facility=new THREE.Group();facility.name='Horizon Launch Complex';scene.add(facility);
function buildFacility(){
  box(facility,0,-.35,0,220,.7,210,0x30393e,0,.98);
  // massive hangar shell and opening
  box(facility,0,20,-82,92,40,22,0x171f26,.7,.5,true);
  box(facility,0,9,-69,74,18,2.5,0x0c1217,.75,.45,true);
  for(const x of[-43,43]) box(facility,x,20,-82,5,40,28,0x25313a,.7,.55,true);
  // launch tower / gantry
  for(const x of[-24,24]){box(facility,x,25,-20,4,50,4,0x465862,.8,.32,true);}
  for(let y=6;y<44;y+=6) box(facility,0,y,-28,52,1.6,3.4,0x52646d,.85,.3,false);
  box(facility,0,25,-28,2.4,47,2.4,0x6b7d85,.9,.25,true);
  // command center
  box(facility,-76,10,8,38,20,32,0x242e36,.45,.55,true);
  box(facility,-76,15,-8,29,7,.55,0x89bfd0,.35,.12,false);
  for(const x of[-58,-47,-36]) box(facility,x,4,-3,7,.2,.8,0x62d9ff,.2,.12,false);
  // runway / apron
  box(facility,0,.02,32,70,.08,90,0x454c50,0,.92,false);
  for(let z=-6;z<75;z+=11){box(facility,0,.08,z,1.2,.05,6,0xd7cfae,0,.8,false)}
  // radar and comms mast
  cyl(facility,-102,10,-14,5,1,0x56646b);cyl(facility,-102,20,-14,.4,20,0x6f818a);box(facility,-105,31,-14,7,.5,1,0x9db2bd,.7,.25,false);
  // perimeter towers
  for(const p of[[-88,12,72],[88,12,72],[-88,12,-24],[88,12,-24]]){cyl(facility,p[0],p[1],p[2],.55,24,0x4f5e65);const light=new THREE.PointLight(0x9edfff,30,55);light.position.set(p[0],24,p[2]);facility.add(light)}
  // solid perimeter terrain — kept clear of the spawn pad
  for(const p of[[-125,20,-92,36,38],[125,24,-90,42,46],[-126,16,118,38,30],[126,18,112,42,34]]){const m=new THREE.Mesh(new THREE.ConeGeometry(p[3],p[4],9),mat(0x3e4c50,.99,0));m.position.set(p[0],p[1],p[2]);m.castShadow=m.receiveShadow=true;facility.add(m);obstacles.push({x:p[0],z:p[2],rx:p[3]*.8,rz:p[3]*.8})}
}
buildFacility();
const player=new THREE.Object3D();player.position.set(0,1.7,68);scene.add(player);player.add(camera);
const rocket=createRocket(scene);rocket.position.set(0,5,-34);obstacles.push({x:rocket.position.x,z:rocket.position.z,rx:9,rz:5});
function makeAnimal(species,x,z,size=1){const g=new THREE.Group();g.name=species;const body=mat(species.includes('wolf')||species.includes('cat')?0x3f332b:species.includes('deer')?0x796348:0x5c695d,.96,0);const dark=mat(0x171b1c,.85,.1);box(g,0,size*.68,0,size*2.4,size*1.05,size*1.1,0x6b6458,0,.95);g.children[0].material=body;box(g,size*.95,size*.86,0,size*.85,size*.75,size*.9,0x6b6458,0,.95);g.children[1].material=body;for(const px of[-.75,.75])for(const pz of[-.35,.35])box(g,px*size,.25*size,pz*size,.25*size,.7*size,.25*size,0x171b1c,0,.95);g.position.set(x,.02,z);g.scale.setScalar(.9+Math.random()*.35);g.userData={baseX:x,baseZ:z,phase:Math.random()*10,roam:.35+Math.random()*.6};scene.add(g);return g}
const animals=[];for(const s of[['feral deer',-42,53],['feral deer',-28,58],['wolf',54,45],['wolf',67,55],['crow',-70,37],['crow',66,30],['feral deer',35,62]])animals.push(makeAnimal(...s,.9));
function openMap(){mapOpen=!mapOpen;if(!mapOpen){panel.style.display='none';return}panel.innerHTML=`<div class="map"><h1>STAR MAP</h1><div class="planet unlocked">EARTH · CURRENT</div><div class="planet ${flightReady?'unlocked':'locked'}">VERDANTIA · ${flightReady?'ROUTE READY':'BOARD THE AE-01 EXPLORER'}</div><div class="planet locked">CRYON · LOCKED</div><div class="planet locked">ARIDION · LOCKED</div><p>M closes map · E calibrates near ship · L launches once ready</p></div>`;panel.style.display='block'}
function save(){saveGame({planet,position:player.position.toArray(),inventory:[...inventory.items],flightReady,launched});panel.textContent='GAME SAVED';panel.style.display='block';setTimeout(()=>panel.style.display='none',1800)}
function enterVerdantia(announce=true){planet='verdantia';facility.visible=false;rocket.visible=false;scene.background.set(0x789b89);scene.fog=new THREE.FogExp2(0x557760,.0042);animals.forEach(a=>a.visible=false);createPlanetEnvironment(scene,'verdantia',91);player.position.set(0,1.7,18);velocity.set(0,0,0);if(announce){objective.textContent='VERDANTIA — Reach the rainforest beacon';panel.innerHTML='<div class="arrival"><h1>VERDANTIA</h1><p>Landing successful.</p><p>Unknown life detected across the basin.</p></div>';panel.style.display='block';setTimeout(()=>panel.style.display='none',5000)}}
function load(){const s=loadGame();if(!s)return;flightReady=!!s.flightReady;launched=!!s.launched;if(s.planet==='verdantia')enterVerdantia(false);else {planet='earth';player.position.fromArray(s.position||[0,1.7,68])}panel.textContent='GAME LOADED';panel.style.display='block';setTimeout(()=>panel.style.display='none',1800)}
objective.textContent=MISSIONS.facility_power.title+' — Reach the Horizon launch complex';
addEventListener('keydown',e=>{keys[e.code]=true;if(e.repeat)return;if(e.code==='KeyV')third=!third;if(e.code==='KeyM')openMap();if(e.code==='F5')save();if(e.code==='F9')load();if(e.code==='Escape'){document.exitPointerLock();enter.style.display='block'}if(e.code==='KeyE'&&planet==='earth'){if(player.position.distanceTo(rocket.position)<18){flightReady=true;objective.textContent='NAVIGATION CALIBRATED — Press L to launch for Verdantia.';quests.complete('rocket_core');openMap()}else{inventory.add('scrap',1);objective.textContent='Collected 1 metal scrap. Keep moving toward the AE-01 Explorer.'}}if(e.code==='KeyL'&&planet==='earth'&&flightReady&&!launched){launched=true;openMap();setTimeout(()=>enterVerdantia(true),850)}if(e.code==='KeyR'&&planet==='verdantia'){inventory.add('fiber',1);objective.textContent='Collected plant fiber. Locate the rainforest beacon.'}});addEventListener('keyup',e=>{keys[e.code]=false});
function focusGame(){renderer.domElement.requestPointerLock();enter.style.display='none'}renderer.domElement.addEventListener('click',focusGame);
document.addEventListener('pointerlockchange',()=>{enter.style.display=document.pointerLockElement?'none':'block'});
document.addEventListener('mousemove',e=>{if(document.pointerLockElement){yaw-=e.movementX*.0022;pitch=THREE.MathUtils.clamp(pitch-e.movementY*.0022,-1.2,1.2)}});
function blocked(x,z){if(x<-106||x>106||z<-112||z>103)return true;for(const o of obstacles){const dx=(x-o.x)/(o.rx||1),dz=(z-o.z)/(o.rz||1);if(dx*dx+dz*dz<1)return true}return false}
function animate(){requestAnimationFrame(animate);const dt=Math.min(.033,Math.max(.001,clock.getDelta()));const sprint=(keys.ShiftLeft||keys.ShiftRight)&&survival.stamina>2;const input=new THREE.Vector3((keys.KeyD?1:0)-(keys.KeyA?1:0),0,(keys.KeyS?1:0)-(keys.KeyW?1:0));if(input.lengthSq()>0)input.normalize();const right=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));const forward=new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw));const desired=new THREE.Vector3().addScaledVector(right,input.x).addScaledVector(forward,input.z).multiplyScalar(sprint?9:5);velocity.lerp(desired,1-Math.exp(-11*dt));if(input.lengthSq()===0)velocity.lerp(new THREE.Vector3(),1-Math.exp(-8*dt));const nx=player.position.x+velocity.x*dt,nz=player.position.z+velocity.z*dt;if(!blocked(nx,player.position.z))player.position.x=nx;else velocity.x=0;if(!blocked(player.position.x,nz))player.position.z=nz;else velocity.z=0;survival.update(dt,sprint);const moving=input.lengthSq()>0;const bob=moving?Math.sin(performance.now()*.012*(sprint?1.2:1))*.025:0;camera.position.set(0,(third?3.15:0)+bob,third?7.5:0);camera.rotation.set(pitch,yaw,0,'YXZ');camera.fov+=(70+(third?3:0)-camera.fov)*.08;camera.updateProjectionMatrix();animals.forEach(a=>{if(!a.visible)return;const t=performance.now()*.00015+a.userData.phase;a.position.x=a.userData.baseX+Math.sin(t)*8*a.userData.roam;a.position.z=a.userData.baseZ+Math.cos(t*.9)*6*a.userData.roam;a.rotation.y=Math.atan2(Math.cos(t),-Math.sin(t))});stats.textContent=`${planet.toUpperCase()} | HP ${survival.health|0} | STAMINA ${survival.stamina|0} | FOOD ${survival.food|0} | WATER ${survival.water|0} | HULL ${ship.hull|0}`;renderer.render(scene,camera)}
const clock=new THREE.Clock();animate();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});