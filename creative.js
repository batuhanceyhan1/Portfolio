import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from './node_modules/three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './node_modules/three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from './node_modules/three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { Lensflare, LensflareElement } from './node_modules/three/examples/jsm/objects/Lensflare.js';
import { OutlinePass } from './node_modules/three/examples/jsm/postprocessing/OutlinePass.js';

//Variables
const raycaster = new THREE.Raycaster();
let camLocked = false;
let mesh;
let spotlightMesh = null;
let notebookMesh = null;
let photo = null;
let ceilLight;
let mixer;
let audioLoader = new THREE.AudioLoader();
let listener = new THREE.AudioListener();
let developianSoundobject;
let CitysoundObject;
let FansoundObject;
let vehicleCanMove = false;
let vehicleMesh;

const camPosition = {
  default: 1,
  macbook: 2,
  image: 3
};

const selectedMap = {
  home: 0,
  office: 1,
  homenight: 2,
  default: 3
};
let map = selectedMap.homenight;

const now = new Date();
const day = now.getDay();
const hours = now.getHours();
const minutes = now.getMinutes();
if ((hours >= 21 && hours < 24) || (hours >= 0 && hours < 5)) {

  map = selectedMap.homenight;
} else if (hours >= 5 && hours < 8) {

  map = selectedMap.home;
} else if (hours >= 8 && hours < 21) {

  map = selectedMap.office;
}
//Renderer Setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor("rgb(0, 0, 0)");
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const fogColor = new THREE.Color("rgb(40, 20,0)");

//document.body.appendChild(renderer.domElement);
document.getElementById("heading").appendChild(renderer.domElement);

// Scene Setup
const scene = new THREE.Scene();
const near = 5;
const far = 25;
scene.fog = new THREE.Fog(fogColor, near, far);
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.set(10, 5, 0.1);

//Composer Setup
const renderPass = new RenderPass(scene, camera);
const effectComposer = new EffectComposer(renderer);
effectComposer.addPass(renderPass);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.34, 1, 0.1);
effectComposer.addPass(bloomPass);
const outlinepass_ = new OutlinePass(
  new THREE.Vector2(window.innerWidth, window.innerHeight), //resolution parameter
  scene,
  camera
);
effectComposer.addPass(outlinepass_);

// Lens flare
const textureLoader = new THREE.TextureLoader();
const textureFlare0 = textureLoader.load("./public/textures/lensflare.png");
const lensFlare = new Lensflare();

// Light Setup
switch (map) {

  case selectedMap.homenight: {
    SetHomeLights('white', 'rgb(128, 165, 224)', 'rgb(128, 165, 224)');
    createHomeSounds();
    break;
  }

  case selectedMap.home: {
    SetHomeLights('white', 'orange', 'rgb(245, 195, 15)');
    createHomeSounds();
    break;
  }

  case selectedMap.office: {
    const ambientLightOffice = new THREE.AmbientLight('white', 1);
    ambientLightOffice.position.set(3.5, 4, 1);
    scene.add(ambientLightOffice);

    const pointLightOffice = new THREE.PointLight('rgb(209, 197, 171)', 20, 10, 1.5);
    pointLightOffice.position.set(3, 4, 1.5);
    pointLightOffice.castShadow = false;
    pointLightOffice.shadow.bias = -0.01;
    scene.add(pointLightOffice);
    break;
  }
}
function SetHomeLights(ambientLightColor, spotLightColor, PointLightColor) {
  const ambientLight = new THREE.AmbientLight(ambientLightColor, 1); //'white'
  ambientLight.position.set(3.5, 2.3, 1.5);
  ambientLight.add(lensFlare);
  scene.add(ambientLight);

  const spotLight = new THREE.SpotLight(spotLightColor, 5, 10, 180, 0.5, 0.25); //'rgb(128, 165, 224)'
  spotLight.position.set(3, 1.5, -2);
  spotLight.target.position.set(3, 1, 0);
  spotLight.castShadow = true;
  spotLight.shadow.bias = -0.001;
  scene.add(spotLight);

  const pointLight = new THREE.PointLight(PointLightColor, 20, 6, 1.5);
  pointLight.position.set(3.3, 3.5, 1.5);
  pointLight.castShadow = false;
  pointLight.shadow.bias = -0.01;
  scene.add(pointLight);
}
function createHomeSounds() {
  const geometry = new THREE.SphereGeometry(0, 5, 5);
  const material = new THREE.MeshBasicMaterial({ color: 0x0077ff });
  developianSoundobject = new THREE.Mesh(geometry, material);
  FansoundObject = new THREE.Mesh(geometry, material);
  CitysoundObject = new THREE.Mesh(geometry, material);
  scene.add(developianSoundobject, FansoundObject, CitysoundObject);
  developianSoundobject.position.set(6.5, 1, -1.7);
  FansoundObject.position.set(3.5, 2.3, 1.5);
  CitysoundObject.position.set(3, 1.5, -2);
}
// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 1.5;
controls.maxDistance = 15;
controls.minPolarAngle = 1;
controls.maxPolarAngle = 1.5;
controls.minAzimuthAngle = -Math.PI / 360; // -45 derece
controls.maxAzimuthAngle = Math.PI / 1.8; // 45 derece
controls.autoRotate = false;
controls.target = new THREE.Vector3(0, 1, 0);
controls.enabled = true;
controls.update();
new THREE.Color("rgb(255, 0, 0)");

switch (map) {

  case selectedMap.homenight: {
    const loader = new GLTFLoader().setPath('public/models/Scenes/EvNight/');
    loader.load('scene.gltf', gltf => {
      mesh = gltf.scene;
      mixer = new THREE.AnimationMixer(mesh);
      const clips = gltf.animations;
      const clip = THREE.AnimationClip.findByName(clips, 'catidle');
      const clip2 = THREE.AnimationClip.findByName(clips, 'Perde');
      const action = mixer.clipAction(clip);
      const action2 = mixer.clipAction(clip2);
      action.play();
      action2.play();

      mesh.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.name === "Spotlight_") {
            spotlightMesh = child;
            spotlightMesh.material.emissive = new THREE.Color('black');
          }
          else if (child.name === "Macbook") {
            notebookMesh = child;
            notebookMesh.material.emissive = new THREE.Color('black');
            notebookMesh.material.color = new THREE.Color('black');
          }
          else if (child.name === "resim_") {
            photo = child;
            photo.material.emissive = new THREE.Color('black');
          }
          else if (child.name === "CeilLight_") {
            ceilLight = child;
          }
        }
      });

      mesh.position.set(0, 0, 0);
      scene.add(mesh);
      //LensFlare Texture load after model imported
      lensFlare.addElement(new LensflareElement(textureFlare0, 512, 0));
      document.getElementById('progress-container').style.display = 'none';
    }, (xhr) => {
      console.log(`loading ${xhr.loaded / xhr.total * 100}%`);
    }, (error) => {
      console.log(`Error: ${error.message}`);
    });
    break;
  }

  case selectedMap.home: {
    const loader = new GLTFLoader().setPath('public/models/Scenes/Ev/');
    loader.load('scene.gltf', gltf => {
      mesh = gltf.scene;
      mixer = new THREE.AnimationMixer(mesh);
      const clips = gltf.animations;
      const clip = THREE.AnimationClip.findByName(clips, 'catidle');
      const clip2 = THREE.AnimationClip.findByName(clips, 'Perde');
      const action = mixer.clipAction(clip);
      const action2 = mixer.clipAction(clip2);
      action.play();
      action2.play();

      mesh.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.name === "Spotlight_") {
            spotlightMesh = child;
            spotlightMesh.material.emissive = new THREE.Color('black');
          }
          else if (child.name === "Macbook") {
            notebookMesh = child;
            notebookMesh.material.emissive = new THREE.Color('black');
            notebookMesh.material.color = new THREE.Color('black');
          }
          else if (child.name === "resim_") {
            photo = child;
            photo.material.emissive = new THREE.Color('black');
          }
          else if (child.name === "CeilLight_") {
            ceilLight = child;
          }
        }
      });

      mesh.position.set(0, 0, 0);
      scene.add(mesh);
      //LensFlare Texture load after model imported
      lensFlare.addElement(new LensflareElement(textureFlare0, 512, 0));
      document.getElementById('progress-container').style.display = 'none';
    }, (xhr) => {
      console.log(`loading ${xhr.loaded / xhr.total * 100}%`);
    }, (error) => {
      console.log(`Error: ${error.message}`);
    });
    break;
  }

  case selectedMap.office: {
    const loaderOffice = new GLTFLoader().setPath('public/models/Scenes/Office/');
    loaderOffice.load('scene.gltf', gltf => {
      mesh = gltf.scene;
      mixer = new THREE.AnimationMixer(mesh);
      const vehicleclips = gltf.animations;
      const vehicleclip = THREE.AnimationClip.findByName(vehicleclips, 'carmove');
      const vehicleaction = mixer.clipAction(vehicleclip);
      vehicleaction.play();

      mesh.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.name == "Macbook") {
            notebookMesh = child;
            notebookMesh.material.emissive = new THREE.Color('black');
            notebookMesh.material.color = new THREE.Color('black');
          }
          else if (child.name == "Car") {
            vehicleMesh = child;
          }
        }
      });

      mesh.position.set(0, 0, 0);
      scene.add(mesh);
      document.getElementById('progress-container').style.display = 'none';
    }, (xhr) => {
      console.log(`loading ${xhr.loaded / xhr.total * 100}%`);
    }, (error) => {
      console.log(`Error: ${error.message}`);
    });
    break;
  }
}

//GLTF Load
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

//MouseMove
document.addEventListener('mousemove', onMouseMove);
function onMouseMove(event) {
  const coords = new THREE.Vector2(
    (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
    -((event.clientY / renderer.domElement.clientHeight) * 2 - 1)
  );
  raycaster.setFromCamera(coords, camera);

  const intersections = raycaster.intersectObjects(scene.children, true);
  if (intersections.length > 0) {
    const selectedObject = intersections[0].object;
    checkHighlightObj(selectedObject);
    updateDivPosition(selectedObject);
  }
}

//CheckHighlightObject
function checkHighlightObj(select) {
  switch (map) {
    case selectedMap.home:
      if (select.name == "Macbook") {
        spotlightMesh.material.emissive = new THREE.Color('white');
        spotlightMesh.material.emissiveIntensity = 5;
        notebookMesh.material.emissive = new THREE.Color('white');
        notebookMesh.material.emissiveIntensity = 1;
        showInteractIcon();
      }
      else if (select.name == "resim_") {
        photo.material.emissive = new THREE.Color('white');
        photo.material.emissiveIntensity = 5;
      }
      else {
        spotlightMesh.material.emissive = new THREE.Color('black');
        notebookMesh.material.emissive = new THREE.Color('black');
        photo.material.emissiveIntensity = 0.5;
        hideInteractIcon();
      }
      break;
    case selectedMap.homenight:
      if (select.name == "Macbook") {
        spotlightMesh.material.emissive = new THREE.Color('white');
        spotlightMesh.material.emissiveIntensity = 5;
        notebookMesh.material.emissive = new THREE.Color('white');
        notebookMesh.material.emissiveIntensity = 1;
        showInteractIcon();
      }
      else if (select.name == "resim_") {
        photo.material.emissive = new THREE.Color('white');
        photo.material.emissiveIntensity = 5;
      }
      else {
        spotlightMesh.material.emissive = new THREE.Color('black');
        notebookMesh.material.emissive = new THREE.Color('black');
        photo.material.emissiveIntensity = 0.5;
        hideInteractIcon();
      }
      break;
    case selectedMap.office:
      if (select.name == "Macbook") {
        notebookMesh.material.emissive = new THREE.Color('white');
        notebookMesh.material.emissiveIntensity = 1;
        showInteractIcon();
      }
      else {
        notebookMesh.material.emissive = new THREE.Color('black');
        hideInteractIcon();
      }
      break;
  }
}

// Mouse click 
document.addEventListener('click', event => {
  const coords = new THREE.Vector2(
    (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
    -((event.clientY / renderer.domElement.clientHeight) * 2 - 1),
  );

  raycaster.setFromCamera(coords, camera);
  const intersections = raycaster.intersectObjects(scene.children, true);

  if (intersections.length > 0) {
    const selectedObject = intersections[0].object;
    checkObjectName(selectedObject);
  }
});

//Object name check
function checkObjectName(select) {
  console.log(select.name);
  if (select.name === "Macbook") {
    controls.enablePan = false;
    switch (map) {
      case selectedMap.homenight:
        cameraMovementHome(camPosition.macbook);
        break;
      case selectedMap.home:
        cameraMovementHome(camPosition.macbook);
        break;
      case selectedMap.office:
        cameraMovementOffice(camPosition.macbook);
        break;
    }
  }
  else if (select.name === "resim_") {
    controls.enablePan = false;
    switch (map) {
      case selectedMap.home:
        cameraMovementHome(camPosition.image);
        break;
    };
  }
  else if (select.name == "Car" || select.name == "MainTable") {
    vehicleCanMove = true;
  }
  else {
    cameraMovementHome();
  }
}

//Audio Loader
window.onload = initializeAudio();
function initializeAudio() {
  listener = new THREE.AudioListener();
  camera.add(listener);
  switch (map) {
    case selectedMap.home: {
      console.log("spawned");
      const developiansound = new THREE.PositionalAudio(listener);
      const urbansound = new THREE.PositionalAudio(listener);
      const fansound = new THREE.PositionalAudio(listener);


      //Sounds
      for (let i = 0; i < 3; i++) {
        switch (i) {
          case 0:
            loadSoundFromPath('./public/sounds/DevelopiaSound.mp3', 0.15, 0.17, developiansound, developianSoundobject);
            break;
          case 1:
            loadSoundFromPath('./public/sounds/urbanAmbient.mp3', 0.6, 1.3, urbansound, CitysoundObject);
            break;
          case 2:
            loadSoundFromPath('./public/sounds/ceiling-fan.mp3', 0.6, 1, fansound, FansoundObject);
            break;
        }
      }
      break;
    }
  }

  function loadSoundFromPath(path, soundVolume, SoundDistance, mainSound, SoundObject) {
    audioLoader.load(path, (buffer) => {
      mainSound.setBuffer(buffer);
      mainSound.setVolume(soundVolume);
      mainSound.setRefDistance(SoundDistance);
      mainSound.loop = true;
      mainSound.play();
      SoundObject.add(mainSound);
    });

    if (ceilLight != null) {
      FansoundObject.add(fansound);
      CitysoundObject.add(urbansound);
    }
  }
}

const clock = new THREE.Clock();
function animate() {

  requestAnimationFrame(animate);
  switch (map) {

    case selectedMap.homenight:
      if (mixer != null && ceilLight != null) {
        mixer.update(clock.getDelta());
        ceilLight.rotation.y -= 0.1;
      }
      break;
    case selectedMap.home:
      if (mixer != null && ceilLight != null) {
        mixer.update(clock.getDelta());
        ceilLight.rotation.y -= 0.1;
      }
      break;
    case selectedMap.office:
      if (mixer != null && vehicleMesh != null && vehicleCanMove) {
        mixer.update(clock.getDelta());

        break;
      }
  }

  controls.update();
  effectComposer.render(scene, camera);

}
animate();

function updateDivPosition(intersects) {
  const div = document.getElementById('interaction');
  const vector = new THREE.Vector3();
  vector.setFromMatrixPosition(notebookMesh.matrixWorld);

  // Project the vector from world space to screen space
  vector.project(camera);

  // Convert to normalized device coordinates (NDC) space [-1, 1]
  const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
  const y = (1 - vector.y * 0.5 - 0.5) * window.innerHeight;

  // Update the div position
  div.style.left = `${x}px`;
  div.style.top = `${y}px`;
}

function showInteractIcon() {
  const div = document.getElementById('interaction');
  div.style.display = 'flex'; // or 'block' depending on your layout
}

function hideInteractIcon() {
  const div = document.getElementById('interaction');
  div.style.display = 'none';
}


function cameraMovementHome(position = null) {
  switch (position) {
    case camPosition.macbook:
      camLocked = true;
      camera.position.set(-0.3, 1, 0);
      controls.target = new THREE.Vector3(-0.6, 1, 0);
      break;
    case camPosition.image:
      camLocked = true;
      camera.position.set(1.1, 3, 0);
      controls.target = new THREE.Vector3(-5, 1.5, 0);
      break;
    default:
      if (camLocked) {
        camera.position.set(10, 5, 0.1);
        camLocked = false;
        controls.target = new THREE.Vector3(0, 1, 0);
      }
      break;
  }
}

function cameraMovementOffice(position = null) {
  switch (position) {
    case camPosition.macbook:
      camLocked = true;
      camera.position.set(3.55, 1.1, 2.75);
      controls.target = new THREE.Vector3(3.55, 1.2, 2.75);
      break;
    default:
      if (camLocked) {
        camera.position.set(10, 5, 0.1);
        camLocked = false;
        controls.target = new THREE.Vector3(0, 1, 0);
      }
      break;
  }
}