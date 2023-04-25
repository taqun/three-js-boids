import * as THREE from "three";

export const FOV = 25;

const MAX_V = 1.8;
const MIN_V = 0.2;

export class Bird {
  constructor(x, y, z) {
    const geometry = new THREE.ConeGeometry(3, 9, 3);
    const material = new THREE.MeshNormalMaterial();
    this.mesh = new THREE.Mesh(geometry, material);

    this.acceleration = new THREE.Vector3();

    this.velocity = new THREE.Vector3(
      MAX_V * 2 * Math.random() - MAX_V,
      MAX_V * 2 * Math.random() - MAX_V,
      MAX_V * 2 * Math.random() - MAX_V
    );

    this.position = new THREE.Vector3(x, y, z);

    this.mesh.position.set(this.position.x, this.position.y, this.position.z);

    this.arrow = new THREE.ArrowHelper(
      this.velocity.clone().normalize(),
      this.position.clone(),
      20,
      0xff0000,
      20 * 0.2,
      5
    );
  }

  // 分離
  forceRule1(birds) {
    const f = new THREE.Vector3();
    if (birds.length == 0) return f;

    birds.forEach((b, i) => {
      const diff = b.clone().sub(this.position);
      const len = diff.length();
      const rf = diff
        .clone()
        .normalize()
        .multiplyScalar(-1)
        .multiplyScalar(1 - len / FOV);

      f.add(rf);
    });

    f.divideScalar(birds.length);

    return f;
  }

  // 整列
  forceRule2(birds) {
    const f = new THREE.Vector3();
    if (birds.length == 0) return f;

    birds.forEach((bird) => {
      f.add(bird.velocity.clone());
    });

    const ave = f.divideScalar(birds.length);

    return ave.sub(this.velocity);
  }

  // 結合
  forceRule3(birds) {
    const f = new THREE.Vector3();
    if (birds.length == 0) return f;

    birds.forEach((bird) => {
      f.add(bird.position.clone());
    });

    const ave = f.divideScalar(birds.length);

    return ave.sub(this.position);
  }

  move(birds, targets) {
    const newv = new THREE.Vector3();

    const f1 = this.forceRule1(targets);
    const f2 = this.forceRule2(birds);
    const f3 = this.forceRule3(birds);

    this.velocity = this.velocity.clone().add(this.acceleration.clone());

    const vlen = this.velocity.length();

    const clampvlen = Math.min(Math.max(vlen, MIN_V), MAX_V);
    this.velocity = this.velocity.clone().normalize().multiplyScalar(clampvlen);

    this.acceleration = f1
      .clone()
      .multiplyScalar(0.8)
      .add(f2.clone().multiplyScalar(0.02))
      .add(f3.clone().multiplyScalar(0.01));

    this.position.add(this.velocity);

    this.mesh.position.x = this.position.x;
    this.mesh.position.y = this.position.y;
    this.mesh.position.z = this.position.z;

    const tipDirection = new THREE.Vector3().addVectors(
      this.position,
      this.velocity
    );
    this.mesh.lookAt(tipDirection);
    this.mesh.rotateX(Math.PI / 2);

    this.arrow.setDirection(this.velocity.clone().normalize());
    this.arrow.position.x = this.mesh.position.x;
    this.arrow.position.y = this.mesh.position.y;
    this.arrow.position.z = this.mesh.position.z;
  }
}
