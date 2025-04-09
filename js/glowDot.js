// === GLOWING DOT ===
const glowMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff });
const glow = new THREE.Mesh(new THREE.SphereGeometry(0.05, 32, 32), glowMaterial);
scene.add(glow);

// === TRAIL ===
const trailLength = 40;
const trailPoints = new Float32Array(trailLength * 3);
const trailGeometry = new THREE.BufferGeometry();
trailGeometry.setAttribute("position", new THREE.BufferAttribute(trailPoints, 3));
const trailMaterial = new THREE.LineBasicMaterial({
  color: 0x00ffff,
  transparent: true,
  opacity: 0.3,
});
const trail = new THREE.Line(trailGeometry, trailMaterial);
scene.add(trail);

// === PARTICLES ===
const particleGeometry = new THREE.BufferGeometry();
const maxParticles = 200;
const particlePositions = new Float32Array(maxParticles * 3);
const particleOpacities = new Float32Array(maxParticles);
const particleVelocities = [];
const particleMaterial = new THREE.PointsMaterial({
  size: 0.03,
  color: 0xffffff,
  transparent: true,
  opacity: 1,
  depthWrite: false,
});
particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
const particles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particles);

// === UPDATE LOOP ===
let t = 0;
let particleIndex = 0;

function updateGlowPosition() {
  t += 0.01;
  const radius = 1;
  glow.position.set(
    Math.sin(t * 0.9) * radius,
    Math.cos(t * 0.7) * radius,
    Math.sin(t * 0.5) * radius * 0.5
  );
}

function updateTrail() {
  for (let i = trailLength - 1; i > 0; i--) {
    trailPoints[i * 3] = trailPoints[(i - 1) * 3];
    trailPoints[i * 3 + 1] = trailPoints[(i - 1) * 3 + 1];
    trailPoints[i * 3 + 2] = trailPoints[(i - 1) * 3 + 2];
  }
  trailPoints[0] = glow.position.x;
  trailPoints[1] = glow.position.y;
  trailPoints[2] = glow.position.z;

  trailGeometry.attributes.position.needsUpdate = true;
}

function spawnParticle(position) {
  const i = particleIndex % maxParticles;

  particlePositions[i * 3] = position.x;
  particlePositions[i * 3 + 1] = position.y;
  particlePositions[i * 3 + 2] = position.z;

  particleOpacities[i] = 1;
  particleVelocities[i] = new THREE.Vector3(
    (Math.random() - 0.5) * 0.05,
    (Math.random() - 0.5) * 0.05,
    (Math.random() - 0.5) * 0.05
  );

  particleIndex++;
}

function updateParticles() {
  for (let i = 0; i < maxParticles; i++) {
    if (particleOpacities[i] <= 0) continue;

    particlePositions[i * 3] += particleVelocities[i]?.x || 0;
    particlePositions[i * 3 + 1] += particleVelocities[i]?.y || 0;
    particlePositions[i * 3 + 2] += particleVelocities[i]?.z || 0;

    particleOpacities[i] -= 0.01;
  }

  particleGeometry.attributes.position.needsUpdate = true;
  particleMaterial.opacity = 1; // Global opacity — set per-particle with shaders if needed
}

// === MAIN LOOP ===
function animate() {
  requestAnimationFrame(animate);

  updateGlowPosition();
  updateTrail();

  if (Math.random() < 0.4) {
    spawnParticle(glow.position);
  }

  updateParticles();

  renderer.render(scene, camera);
}

animate();