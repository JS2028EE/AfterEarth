import * as THREE from 'three';
import './style.css';
import {createRocket} from './rocket.js';
import {SurvivalSystem,InventorySystem,QuestSystem,ShipSystem} from './systems.js';
import {createPlanetEnvironment,WORLD_SPECS} from './worlds.js';
import {WildlifeManager} from './animals.js';
import {MISSIONS} from './missionData.js';
import {saveGame,loadGame} from './save.js';

const app=document.querySelector('#app');
app.innerHTML=`<div id="hud"><b>AFTEREARTH</b><span id="objective"></span><div id="stats"></div><div id="help">WASD move · Shift sprint · E interact/board · V camera · I inventory · M planet map · L launch to Verdantia · F5 save · F9 load · Click look</div></div><div id="crosshair">+</div><div id="panel"></div>`;
const objective=document.querySelector('#objective'),stats=document.querySelector('#stats'),panel=document.querySelector('#panel');
const scene=new THREE.Scene();scene.background=new THREE.Color(0x070b12);scene.fog=new THREE.Fog(0x070b12,35,220);
const camera=new THREE.PerspectiveCamera(70,innerWidth/innerHeight,.1,700);const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;app.appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0x9fb9d8,0x182018,2));const sun=new THREE.DirectionalLight(0xffffff,2);sun.position.set(20,40,10);sun.castShadow=true;scene.add(sun);
const player=new THREE.Object3D();player.position.set(0,1.7,12);scene.add(player);player.add(camera);
const survival=new SurvivalSystem(),inventory=new InventorySystem(),quests=new QuestSystem(),ship=new ShipSystem();
let planet='earth',third=false,yaw=0,pitch=0,world=null,rocket=null,launched=false;const keys={};
const unlocked=new Set(['earth']);
function buildPlanet(id){if(world)scene.remove(world);world=createPlanetEnvironment(scene,id,17);planet=id;objective.textContent=`${WORLD_SPECS[id].name}: ${WORLD_SPECS[id].biomes.join(' · ')}`;if(id==='verdantia'){new WildlifeManager(id).spawn(18);player.position.set(0,1.7,18)}else player.position.set(0,1.7,12)}
function showPanel(text){panel.innerHTML=text;panel.style.display='block';setTimeout(()=>panel.style.display='none',5000)}
function map(){showPanel(`<h2>STAR MAP</h2><p>Earth — UNLOCKED</p><p>Verdantia — ${unlocked.has('verdantia')?'UNLOCKED':'available after launch calibration'}</p><p>Cryon — LOCKED</p><p>Aridion — LOCKED</p>`)}
function inventoryPanel(){const entries=[...inventory.items.entries()].map(([id,n])=>`${id}: ${n}`).join('<br>')||'Empty';showPanel(`<h2>BACKPACK</h2>${entries}<p>Collect scrap, fiber, water and rations with E.</p>`)}
objective.textContent=MISSIONS.facility_power.title+' — '+MISSIONS.facility_power.steps[0];
rocket=createRocket(scene);buildPlanet('earth');
addEventListener('keydown',e=>{keys[e.code]=true;if(e.code==='KeyV')third=!third;if(e.code==='KeyM')map();if(e.code==='KeyI')inventoryPanel();if(e.code==='F5'){saveGame({planet,position:player.position.toArray(),inventory:[...inventory.items],unlocked:[...unlocked]});showPanel('GAME SAVED')}if(e.code==='F9'){const s=loadGame();if(s){planet=s.planet;player.position.fromArray(s.position);unlocked.clear();s.unlocked.forEach(x=>unlocked.add(x));showPanel('GAME LOADED')}}if(e.code==='KeyE'){inventory.add('scrap',1);objective.textContent='Collected scrap. Find the rocket control room.'}if(e.code==='KeyL'&&!launched){launched=true;unlocked.add('verdantia');buildPlanet('verdantia');objective.textContent='Verdantia reached. Locate the rainforest beacon.';showPanel('LAUNCH SUCCESS — ARRIVED AT VERDANTIA')}if(e.code==='KeyR'&&planet==='verdantia'){inventory.add('fiber',1);objective.textContent='Collected plant fiber. Explore the canopy signal.'}});addEventListener('keyup',e=>keys[e.code]=false);
renderer.domElement.onclick=()=>renderer.domElement.requestPointerLock();document.onmousemove=e=>{if(document.pointerLockElement){yaw-=e.movementX*.002;pitch=Math.max(-1.4,Math.min(1.4,pitch-e.movementY*.002))}};
function animate(){requestAnimationFrame(animate);const dt=.016,sprint=(keys.ShiftLeft||keys.ShiftRight)&&survival.stamina>0,speed=sprint?.2:.1;const f=new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw)),r=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));if(keys.KeyW)player.position.addScaledVector(f,-speed);if(keys.KeyS)player.position.addScaledVector(f,speed);if(keys.KeyA)player.position.addScaledVector(r,-speed);if(keys.KeyD)player.position.addScaledVector(r,speed);player.position.x=THREE.MathUtils.clamp(player.position.x,-190,190);player.position.z=THREE.MathUtils.clamp(player.position.z,-190,190);survival.update(dt,sprint);camera.position.set(0,third?3:0,third?7:0);camera.rotation.set(pitch,yaw,0,'YXZ');stats.textContent=`WORLD ${planet.toUpperCase()} | HP ${survival.health|0} | STAMINA ${survival.stamina|0} | FOOD ${survival.food|0} | WATER ${survival.water|0} | HULL ${ship.hull|0}`;renderer.render(scene,camera)}animate();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});