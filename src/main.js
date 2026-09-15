import * as THREE from 'three';
import './style.css';

const app=document.querySelector('#app');
app.innerHTML=`<div id="hud"><b>AFTEREARTH</b><span id="objective">Objective: Explore the launch facility</span><div id="stats">HP 100 | STAMINA 100 | FOOD 100 | WATER 100</div><div id="help">WASD move · Shift sprint · E interact · V camera · I inventory · M map · Click to look</div></div><div id="crosshair">+</div>`;
const scene=new THREE.Scene(); scene.background=new THREE.Color(0x070b12); scene.fog=new THREE.Fog(0x070b12,35,180);
const camera=new THREE.PerspectiveCamera(70,innerWidth/innerHeight,.1,500); camera.position.set(0,2,8);
const renderer=new THREE.WebGLRenderer({antialias:true}); renderer.setSize(innerWidth,innerHeight); renderer.shadowMap.enabled=true; app.appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0x9fb9d8,0x182018,2)); const sun=new THREE.DirectionalLight(0xffffff,2); sun.position.set(20,40,10); sun.castShadow=true; scene.add(sun);
const floor=new THREE.Mesh(new THREE.PlaneGeometry(300,300),new THREE.MeshStandardMaterial({color:0x22272b,roughness:.9})); floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; scene.add(floor);
function box(x,y,z,sx,sy,sz,c=0x39434b){const m=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),new THREE.MeshStandardMaterial({color:c,metalness:.35,roughness:.7}));m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;scene.add(m);return m}
for(let i=0;i<18;i++){box((Math.random()-.5)*70,2,(Math.random()-.5)*70,4+Math.random()*8,4,4+Math.random()*8,0x26323b)}
box(0,5,-28,45,10,3,0x17242d); box(-22,2,-15,3,4,30,0x31404a); box(22,2,-15,3,4,30,0x31404a);
const player=new THREE.Object3D(); player.position.set(0,1.7,12); scene.add(player); player.add(camera);
const keys={}; addEventListener('keydown',e=>{keys[e.code]=true;if(e.code==='KeyV') third=!third;if(e.code==='KeyE') objective.textContent='Objective: Search the rocket control room';}); addEventListener('keyup',e=>keys[e.code]=false);
let yaw=0,pitch=0,third=false; renderer.domElement.addEventListener('click',()=>renderer.domElement.requestPointerLock()); document.addEventListener('mousemove',e=>{if(document.pointerLockElement){yaw-=e.movementX*.002;pitch-=e.movementY*.002;pitch=Math.max(-1.4,Math.min(1.4,pitch));}});
const objective=document.querySelector('#objective'); let hp=100,st=100,food=100,water=100;
function animate(){requestAnimationFrame(animate);let speed=keys.ShiftLeft&&st>0?0.18:0.09;let f=new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw));let r=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));if(keys.KeyW)player.position.addScaledVector(f,-speed);if(keys.KeyS)player.position.addScaledVector(f,speed);if(keys.KeyA)player.position.addScaledVector(r,-speed);if(keys.KeyD)player.position.addScaledVector(r,speed);if(keys.ShiftLeft)st=Math.max(0,st-.12);else st=Math.min(100,st+.05);food=Math.max(0,food-.001);water=Math.max(0,water-.002);camera.position.set(third?0:0,third?3:0,third?7:0);camera.rotation.set(pitch,yaw,0,'YXZ');document.querySelector('#stats').textContent=`HP ${hp|0} | STAMINA ${st|0} | FOOD ${food|0} | WATER ${water|0}`;renderer.render(scene,camera)} animate();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});