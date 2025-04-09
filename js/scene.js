const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const light = new THREE.PointLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);