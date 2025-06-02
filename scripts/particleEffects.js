import * as THREE from 'three';

// Particle pools and management
const trailParticlesPool = [];
const clickParticlesPool = [];
const activeParticles = []; // Stores { mesh, velocity, age, lifetime, type, initialScale, initialEmissiveIntensity }

const MAX_TRAIL_PARTICLES_IN_POOL = 150;
const MAX_CLICK_PARTICLES_IN_POOL = 150;
const MAX_CLICK_PARTICLES_PER_BURST = 50;
const MAX_TOTAL_ACTIVE_PARTICLES = 500;



let trailParticlePoolIndex = 0;
let clickParticlePoolIndex = 0;

// Particle settings
const PARTICLE_LIFETIME_TRAIL = 0.7; // seconds
const PARTICLE_LIFETIME_CLICK = 2.0; // seconds
const NEON_COLORS = [
    new THREE.Color(0xADD8E6), // LightBlue
    new THREE.Color(0xB0E0E6), // PowderBlue
    new THREE.Color(0xAFEEEE), // PaleTurquoise
    new THREE.Color(0x87CEFA), // LightSkyBlue
    new THREE.Color(0xCAE1FF), // Very light, almost white-blue for highlights
    new THREE.Color(0x9ACEEB), // A slightly deeper sky blue
];

// Mouse state - these will be updated by new handler functions
let lastMousePos = new THREE.Vector2();
let currentMousePos = new THREE.Vector2();
let mouseMovedSinceLastTrail = false;

// Particle Group - this will be added to the active scene
let particleGroup;
const clock = new THREE.Clock(); // For delta time in updateParticles
const raycaster = new THREE.Raycaster();

// Store the current active scene context
let currentActiveScene = null;
let currentActiveCamera = null;
let currentActiveContainer = null;

export function initializeParticleSystem() {
    particleGroup = new THREE.Group();
    populateParticlePools(); // Populates pools and adds to the module-level particleGroup
    // Note: particleGroup is NOT added to any scene here.
    // It will be added to the active section's scene when particles are first spawned in it.

    // Initialize mouse positions
    currentMousePos.set(-1, -1); 
    lastMousePos.set(-1, -1);
}

function ensureParticleGroupInScene(scene) {
    if (scene && particleGroup.parent !== scene) {
        if (particleGroup.parent) {
            particleGroup.parent.remove(particleGroup); // Remove from old scene if any
        }
        scene.add(particleGroup); // Add to new active scene
    }
}

function createParticleMaterial() {
    return new THREE.MeshPhysicalMaterial({
        color: 0xffffff, // Base color, will be overridden by NEON_COLORS
        metalness: 0.2,  // Reduced for more glassy appearance
        roughness: 0.1,  // Shiny surface
        transparent: true,
        opacity: 1.0,
        emissive: 0xffffff, // Emissive color, will be overridden
        emissiveIntensity: 1.0,
        clearcoat: 0.7,         // Extra layer of shininess
        clearcoatRoughness: 0.1, // Sharp clearcoat highlights
        // side: THREE.DoubleSide, // Consider if backfaces are an issue
        // transmission: 0.5, // For more true glass, but performance heavy
        // thickness: 0.1,    // Required for transmission
    });
}

function populateParticlePools() {
    const particleGeometry = new THREE.BoxGeometry(1, 1, 1); // Changed from PlaneGeometry

    for (let i = 0; i < MAX_TRAIL_PARTICLES_IN_POOL; i++) {
        const material = createParticleMaterial();
        const particleMesh = new THREE.Mesh(particleGeometry, material);
        particleMesh.visible = false;
        trailParticlesPool.push(particleMesh);
        particleGroup.add(particleMesh);
    }

    for (let i = 0; i < MAX_CLICK_PARTICLES_IN_POOL; i++) {
        const material = createParticleMaterial();
        const particleMesh = new THREE.Mesh(particleGeometry, material);
        particleMesh.visible = false;
        clickParticlesPool.push(particleMesh);
        particleGroup.add(particleMesh);
    }
}

function getPooledParticle(type) {
    const pool = type === 'trail' ? trailParticlesPool : clickParticlesPool;
    let poolIndexRef = type === 'trail' ? 'trailParticlePoolIndex' : 'clickParticlePoolIndex';
    let currentIndex = type === 'trail' ? trailParticlePoolIndex : clickParticlePoolIndex;

    for (let i = 0; i < pool.length; i++) {
        const pIdx = (currentIndex + i) % pool.length;
        if (!pool[pIdx].visible) {
            if (type === 'trail') trailParticlePoolIndex = (pIdx + 1) % pool.length;
            else clickParticlePoolIndex = (pIdx + 1) % pool.length;
            return pool[pIdx];
        }
    }
    // console.warn(\`Particle pool for type "\${type}" exhausted.\`);
    return null; 
}

// MODIFIED spawnParticle: Now requires active scene, camera, and container for raycasting
function spawnParticle(mouseX, mouseY, type, activeScene, activeCamera, activeContainer) {
    if (!activeScene || !activeCamera || !activeContainer) {
        // console.warn("Attempted to spawn particle without active scene context.");
        return;
    }
    ensureParticleGroupInScene(activeScene);

    if (activeParticles.length >= MAX_TOTAL_ACTIVE_PARTICLES) return;

    const particleMesh = getPooledParticle(type);
    if (!particleMesh) return;

    // Calculate mouse position and any needed offsets
    const rect = activeContainer.getBoundingClientRect();
    let offsetX = mouseX;
    let offsetY = mouseY;
    let cursorDirection = new THREE.Vector2();

    if (type === 'trail' && mouseMovedSinceLastTrail) {
        // Calculate the direction of cursor movement
        cursorDirection.copy(currentMousePos).sub(lastMousePos).normalize();
        // Offset the spawn position slightly behind the cursor
        const offset = 10; // pixels
        offsetX = mouseX - cursorDirection.x * offset;
        offsetY = mouseY - cursorDirection.y * offset;
    }

    // Calculate normalized device coordinates (-1 to +1)
    const x = ((offsetX - rect.left) / rect.width) * 2 - 1;
    const y = -((offsetY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera({ x, y }, activeCamera);
    const intersects = raycaster.intersectObjects(activeScene.children, true); // Check all objects in the scene

    let spawnPosition = null;

    if (intersects.length > 0) {
        // Spawn at the first intersection point
        spawnPosition = intersects[0].point.clone();
        // Optional: add a small offset towards the camera to avoid z-fighting
        const offsetDirection = intersects[0].point.clone().sub(activeCamera.position).normalize();
        spawnPosition.addScaledVector(offsetDirection, 0.1);
    } else {
        // Fallback: If no intersection, project onto a plane at a certain distance from the camera
        const vec = new THREE.Vector3(x, y, 0.5);
        vec.unproject(activeCamera);
        const dir = vec.sub(activeCamera.position).normalize();
        const distance = 20;
        spawnPosition = activeCamera.position.clone().add(dir.multiplyScalar(distance));
    }
    
    particleMesh.position.copy(spawnPosition);
    particleMesh.rotation.set(0, 0, 0);

    const neonColor = NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)].clone();
    particleMesh.material.color.copy(neonColor);
    particleMesh.material.emissive.copy(neonColor);
    particleMesh.material.emissiveIntensity = 1.2; // Slightly brighter emissive
    particleMesh.material.opacity = 1.0;

    // Calculate distance from camera to spawn position
    const distanceToCamera = spawnPosition.distanceTo(activeCamera.position);
    
    // Base size calculations - more cube-like proportions
    let baseSize, baseWidth, baseHeight, baseDepth;
    if (type === 'trail') {
        // Increased trail particle size, slight random variation but maintaining cube-like shape
        baseSize = (Math.random() * 0.15 + 0.2); // Base size 0.2 to 0.35
        // Add slight variation while keeping roughly cubic proportions
        baseWidth = baseSize * (0.9 + Math.random() * 0.2);   // 90% to 110% of base size 
        baseHeight = baseSize * (0.9 + Math.random() * 0.2);  // 90% to 110% of base size
        baseDepth = baseSize * (0.9 + Math.random() * 0.2);   // 90% to 110% of base size
    } else { // click
        // Click particles - keeping existing size but making more cubic
        baseSize = (Math.random() * 0.25 + 0.15); // 0.15 to 0.4
        baseWidth = baseSize * (0.9 + Math.random() * 0.2);
        baseHeight = baseSize * (0.9 + Math.random() * 0.2);
        baseDepth = baseSize * (0.9 + Math.random() * 0.2);
    }

    // Scale factor based on distance (linear scaling with a minimum size)
    const targetScreenSize = type === 'trail' ? 0.025 : 0.03; // Increased trail particle screen size to match click particles
    const scaleFactor = Math.max(distanceToCamera * targetScreenSize, 0.1);
    
    // Apply the distance-based scaling
    baseWidth *= scaleFactor;
    baseHeight *= scaleFactor;
    baseDepth *= scaleFactor;
    
    particleMesh.scale.set(baseWidth, baseHeight, baseDepth);

    let velocity;
    let angularVelocity = new THREE.Vector3(0, 0, 0);

    if (type === 'trail') {
        const moveDirectionVec = currentMousePos.clone().sub(lastMousePos);

        if (mouseMovedSinceLastTrail && moveDirectionVec.lengthSq() > 0.0001) {
            const angle = Math.atan2(moveDirectionVec.y, moveDirectionVec.x);
            particleMesh.rotation.z = angle - Math.PI / 2;

            // Calculate velocity based on cursor movement
            const direction = moveDirectionVec.normalize();
            const speed = 2 + Math.random() * 1; // Increased base speed
            const mainVelocity = direction.clone().multiplyScalar(speed);
            
            // Add slight spread perpendicular to movement
            const perpendicularDirection = new THREE.Vector2(-direction.y, direction.x);
            const spreadSpeed = (Math.random() - 0.5) * 0.3; // Reduced spread
            const spreadVelocity = perpendicularDirection.multiplyScalar(spreadSpeed);
            
            // Add slight forward bias in the cursor movement direction
            mainVelocity.multiplyScalar(1.2); // 20% faster in movement direction
            
            velocity = new THREE.Vector3(
                mainVelocity.x + spreadVelocity.x,
                mainVelocity.y + spreadVelocity.y,
                (Math.random() - 0.5) * 0.05 // Reduced Z spread
            );
        } else {
             particleMesh.rotation.z = (Math.random() - 0.5) * 0.5; 
             velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.2, 
                (Math.random() - 0.5) * 0.2, 
                (Math.random() - 0.5) * 0.1
            ); 
        }
        angularVelocity.z = (Math.random() - 0.5) * Math.PI * 0.5; 
        angularVelocity.x = (Math.random() - 0.5) * Math.PI * 0.1; 
        angularVelocity.y = (Math.random() - 0.5) * Math.PI * 0.1; 
    } else { // click
        const angle = Math.random() * Math.PI * 2;
        const speed = 2.5 + Math.random() * 3.5; // Adjusted from 13.5, was too high
        velocity = new THREE.Vector3(Math.cos(angle) * speed, Math.sin(angle) * speed, (Math.random() - 0.5) * speed * 0.2);
        angularVelocity.z = (Math.random() - 0.5) * Math.PI; 
        angularVelocity.x = (Math.random() - 0.5) * Math.PI * 0.5; 
        angularVelocity.y = (Math.random() - 0.5) * Math.PI * 0.5; 
    }

    particleMesh.visible = true;
    activeParticles.push({
        mesh: particleMesh,
        velocity: velocity,
        angularVelocity: angularVelocity,
        age: 0,
        lifetime: (type === 'trail' ? PARTICLE_LIFETIME_TRAIL : PARTICLE_LIFETIME_CLICK) * (0.8 + Math.random() * 0.4),
        type: type,
        initialScale: new THREE.Vector3(baseWidth, baseHeight, baseDepth),
        initialEmissiveIntensity: particleMesh.material.emissiveIntensity,
    });
}

// Track last spawn time for rate limiting
let lastSpawnTime = 0;
const SPAWN_INTERVAL = 32; // Minimum milliseconds between spawns (about 30 per second)

export function handleMouseMoveForParticles(event, activeSceneData) {
    if (!activeSceneData || !activeSceneData.scene || !activeSceneData.camera || !activeSceneData.container) return;
    currentActiveScene = activeSceneData.scene;
    currentActiveCamera = activeSceneData.camera;
    currentActiveContainer = activeSceneData.container;

    if (currentMousePos.x === -1) { // First move
        currentMousePos.set(event.clientX, event.clientY);
        lastMousePos.copy(currentMousePos);
    } else {
        lastMousePos.copy(currentMousePos);
        currentMousePos.set(event.clientX, event.clientY);
        mouseMovedSinceLastTrail = true;
    }

    // Rate limit particle spawning
    const now = performance.now();
    if (now - lastSpawnTime >= SPAWN_INTERVAL) {
        spawnParticle(event.clientX, event.clientY, 'trail', currentActiveScene, currentActiveCamera, currentActiveContainer);
        lastSpawnTime = now;
    }
}

export function handleMouseClickForParticles(event, activeSceneData) {
    if (!activeSceneData || !activeSceneData.scene || !activeSceneData.camera || !activeSceneData.container) return;
    currentActiveScene = activeSceneData.scene;
    currentActiveCamera = activeSceneData.camera;
    currentActiveContainer = activeSceneData.container;

    const numClickParticles = 15 + Math.floor(Math.random() * (MAX_CLICK_PARTICLES_PER_BURST - 15));
    for (let i = 0; i < numClickParticles; i++) {
        spawnParticle(event.clientX, event.clientY, 'click', currentActiveScene, currentActiveCamera, currentActiveContainer);
    }
}

// updateParticles remains largely the same, but it's now exported to be called externally
export function updateParticles() {
    const deltaTime = clock.getDelta();

    for (let i = activeParticles.length - 1; i >= 0; i--) {
        const p = activeParticles[i];
        p.age += deltaTime;

        if (p.age >= p.lifetime) {
            p.mesh.visible = false;
            activeParticles.splice(i, 1);
            continue;
        }

        p.mesh.position.addScaledVector(p.velocity, deltaTime);
        
        p.mesh.rotation.x += p.angularVelocity.x * deltaTime;
        p.mesh.rotation.y += p.angularVelocity.y * deltaTime;
        p.mesh.rotation.z += p.angularVelocity.z * deltaTime; 

        if (p.type === 'click') {
            p.velocity.y -= 2.5 * deltaTime; // Gravity
            p.velocity.multiplyScalar(0.99); 
        } else { 
            p.velocity.multiplyScalar(0.95); 
        }

        const lifeRatio = p.age / p.lifetime; 
        const easedOpacityRatio = 1 - Math.pow(1 - lifeRatio, 3);
        p.mesh.material.opacity = Math.max(0, 1.0 - easedOpacityRatio);
        p.mesh.material.emissiveIntensity = p.initialEmissiveIntensity * Math.max(0, (1.0 - lifeRatio));

        const shrinkFactor = Math.pow(lifeRatio, 2);
        p.mesh.scale.x = p.initialScale.x * (1.0 - shrinkFactor);
        p.mesh.scale.y = p.initialScale.y * (1.0 - shrinkFactor);
        p.mesh.scale.z = p.initialScale.z * (1.0 - shrinkFactor); 
        
        p.mesh.scale.x = Math.max(p.mesh.scale.x, 0.0001);
        p.mesh.scale.y = Math.max(p.mesh.scale.y, 0.0001);
        p.mesh.scale.z = Math.max(p.mesh.scale.z, 0.0001); 
    }
    if (mouseMovedSinceLastTrail) {
        mouseMovedSinceLastTrail = false; 
    }
}
