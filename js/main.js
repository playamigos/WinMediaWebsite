const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

loadConfig('assets/config.json');

function animate(t = 0) {
  requestAnimationFrame(animate);
  highlightOnHover();

  raycaster.setFromCamera(mouse, camera);
  const planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const intersect = new THREE.Vector3();
  raycaster.ray.intersectPlane(planeZ, intersect);
  glow.position.lerp(intersect, 0.05);

  const trailPositions = trail.geometry.attributes.position.array;
  for (let i = trailPositions.length - 3; i >= 3; i--) {
    trailPositions[i] = trailPositions[i - 3];
  }
  trailPositions[0] = glow.position.x;
  trailPositions[1] = glow.position.y;
  trailPositions[2] = glow.position.z;
  trail.geometry.attributes.position.needsUpdate = true;

  scene.traverse(obj => { if (obj.tick) obj.tick(t * 0.001); });
//   controls.update();
  renderer.render(scene, camera);
}
animate();