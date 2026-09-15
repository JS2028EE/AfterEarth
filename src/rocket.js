import * as THREE from 'three';

const metal=new THREE.MeshStandardMaterial({color:0x9ca8b2,metalness:.92,roughness:.2});
const dark=new THREE.MeshStandardMaterial({color:0x111922,metalness:.7,roughness:.22});
const glass=new THREE.MeshPhysicalMaterial({color:0x102b40,metalness:.25,roughness:.04,transmission:.45,transparent:true,opacity:.92});
const glow=new THREE.MeshBasicMaterial({color:0x62d9ff});

function mesh(g,m,p=[0,0,0],r=[0,0,0]){const o=new THREE.Mesh(g,m);o.position.set(...p);o.rotation.set(...r);o.castShadow=o.receiveShadow=true;return o}

export function createRocket(scene){
  const ship=new THREE.Group();ship.name='AE-01 Explorer Lander';
  ship.add(mesh(new THREE.BoxGeometry(15,2.8,6.2),metal,[0,0,0]));
  ship.add(mesh(new THREE.BoxGeometry(8,1.8,5.2),dark,[-1.5,2.0,0]));
  ship.add(mesh(new THREE.WedgeGeometry?new THREE.BoxGeometry(6,2.3,5.8):new THREE.BoxGeometry(6,2.3,5.8),glass,[4.5,1.7,0]));
  ship.add(mesh(new THREE.BoxGeometry(3.2,1.1,5.5),dark,[7.5,-.2,0]));
  for(const z of[-4.0,4.0]) ship.add(mesh(new THREE.BoxGeometry(8,.45,3.0),metal,[-1.5,-1.5,z]));
  for(const z of[-2.0,2.0]) for(const x of[-5,3]){
    const leg=mesh(new THREE.CylinderGeometry(.35,.48,3.5,10),dark,[x,-2,z]);ship.add(leg);
    ship.add(mesh(new THREE.CylinderGeometry(.7,.7,.16,16),dark,[x,-3.7,z]));
  }
  for(const x of[-5,-2,1,4]){ship.add(mesh(new THREE.BoxGeometry(.35,.15,2.8),glow,[x,-1.48,0]));}
  for(const x of[-6,6]) ship.add(mesh(new THREE.CylinderGeometry(.6,.6,1.8,16),glow,[x,0,0],[Math.PI/2,0,0]));
  ship.userData.interactable=true;ship.position.set(0,5,-34);scene.add(ship);return ship;
}