import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";

import { Bird, FOV } from "./bird";
import "./styles.css";

const stats = new Stats();
document.body.appendChild(stats.dom);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const birds = [];

const BIRD_NUM = 500;
const FIELD_SIZE = 200;

for (let i = 0; i < BIRD_NUM; i++) {
  const x = FIELD_SIZE * 2 * Math.random() - FIELD_SIZE;
  const y = FIELD_SIZE * 2 * Math.random() - FIELD_SIZE;
  const z = FIELD_SIZE * 2 * Math.random() - FIELD_SIZE;

  const bird = new Bird(x, y, z);
  birds.push(bird);

  scene.add(bird.mesh);
  //scene.add(bird.arrow);
}

camera.position.z = 200;

const planeRight = new THREE.Plane(new THREE.Vector3(-1, 0, 0), FIELD_SIZE);
const planeUp = new THREE.Plane(new THREE.Vector3(0, -1, 0), FIELD_SIZE);
const planeLeft = new THREE.Plane(new THREE.Vector3(1, 0, 0), FIELD_SIZE);
const planeDown = new THREE.Plane(new THREE.Vector3(0, 1, 0), FIELD_SIZE);
const planeForward = new THREE.Plane(new THREE.Vector3(0, 0, -1), FIELD_SIZE);
const planeBack = new THREE.Plane(new THREE.Vector3(0, 0, 1), FIELD_SIZE);

const planes = [
  // planeRight,
  // planeUp,
  // planeLeft,
  // planeDown,
  // planeForward,
  // planeBack,
];

function planeToMesh(plane) {
  const helper = new THREE.PlaneHelper(plane, FIELD_SIZE * 2, 0xffffff);
  scene.add(helper);
}

planes.forEach((plane) => {
  planeToMesh(plane);
});

let isRendering = true;

function animate() {
  if (isRendering) {
    requestAnimationFrame(animate);
  }

  birds.forEach((bird) => {
    const birdsInFov = [];
    const targetsInFov = [];

    const distr = planeRight.distanceToPoint(bird.position);
    if (distr < FOV) {
      const vBird = bird.position
        .clone()
        .sub(planeRight.normal.clone().multiplyScalar(distr));
      targetsInFov.push(vBird);
    }

    const distu = planeUp.distanceToPoint(bird.position);
    if (distu < FOV) {
      const vBird = bird.position
        .clone()
        .sub(planeUp.normal.clone().multiplyScalar(distu));
      targetsInFov.push(vBird);
    }

    const distl = planeLeft.distanceToPoint(bird.position);
    if (distl < FOV) {
      const vBird = bird.position
        .clone()
        .sub(planeLeft.normal.clone().multiplyScalar(distl));
      targetsInFov.push(vBird);
    }

    const distd = planeDown.distanceToPoint(bird.position);
    if (distd < FOV) {
      const vBird = bird.position
        .clone()
        .sub(planeDown.normal.clone().multiplyScalar(distd));
      targetsInFov.push(vBird);
    }

    const distf = planeForward.distanceToPoint(bird.position);
    if (distf < FOV) {
      const vBird = bird.position
        .clone()
        .sub(planeForward.normal.clone().multiplyScalar(distf));
      targetsInFov.push(vBird);
    }

    const distb = planeBack.distanceToPoint(bird.position);
    if (distb < FOV) {
      const vBird = bird.position
        .clone()
        .sub(planeBack.normal.clone().multiplyScalar(distb));
      targetsInFov.push(vBird);
    }

    birds.forEach((target) => {
      if (bird != target) {
        const diff = target.position.clone().sub(bird.position);
        const len = diff.length();

        if (len < FOV) {
          birdsInFov.push(target);
          targetsInFov.push(target.position.clone());
        }
      }
    });

    bird.move(birdsInFov, targetsInFov);
  });

  renderer.render(scene, camera);

  stats.update();
}

document.getElementsByTagName("body")[0].addEventListener("click", () => {
  isRendering = !isRendering;

  if (isRendering) {
    animate();
  }
});

animate();
