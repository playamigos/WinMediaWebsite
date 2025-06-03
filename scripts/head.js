import { setupScene } from './threeSetup.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as THREE from 'three';

// Module-level variables
let headSceneObjects;
let targetRotation = { x: 0, y: 0 };
let currentRotation = { x: 0, y: 0 };
let model;

export function initHead() {
    const containerId = 'head-section';
    headSceneObjects = setupScene(containerId);

    // Load the GLTF model
    const loader = new GLTFLoader();
    loader.load('scenes/Head_scene.glb', (gltf) => {
        model = gltf.scene;
        headSceneObjects.convertLightIntensities(model);
        headSceneObjects.scene.add(model);
        
        // Start the animation loop
        animate();
    }, undefined, (error) => {
        console.error('An error occurred while loading the GLTF model:', error);
    });

    return headSceneObjects;
}

document.addEventListener('mousemove', (event) => {
    if (!model) return;

    const { clientX, clientY } = event;
    const { innerWidth, innerHeight } = window;

    // Update target rotation based on mouse position
    targetRotation.x = ((clientY / innerHeight) - 0.5) * Math.PI * 0.01;
    targetRotation.y = ((clientX / innerWidth) - 0.5) * Math.PI * 0.01;
});

function animate() {
    if (!model) return;

    // Spring constants
    const springStrength = 0.08;
    const damping = 0.95;

    // Calculate spring physics
    const dx = targetRotation.x - currentRotation.x;
    const dy = targetRotation.y - currentRotation.y;

    // Apply spring force
    currentRotation.x += dx * springStrength;
    currentRotation.y += dy * springStrength;

    // Apply damping
    currentRotation.x *= damping;
    currentRotation.y *= damping;

    // Apply rotation to the model
    model.rotation.x = currentRotation.x;
    model.rotation.y = currentRotation.y;

    // Request next frame
    requestAnimationFrame(animate);
}


