import { setupScene } from './threeSetup.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// Module-level variable to store all scene objects and the animated mesh
let headSceneObjects;

export function initHead() {
    const containerId = 'head-section';
    headSceneObjects = setupScene(containerId);

    // Load the GLTF model
    const loader = new GLTFLoader();
    loader.load('scenes/Head_scene.glb', (gltf) => {
        const model = gltf.scene;
        headSceneObjects.scene.add(model);
    }, undefined, (error) => {
        console.error('An error occurred while loading the GLTF model:', error);
    });

    // Add ambient light to the scene
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Adjust intensity as needed
    headSceneObjects.scene.add(ambientLight);

    // Add bloom effect
    const composer = new EffectComposer(headSceneObjects.renderer);
    const renderPass = new RenderPass(headSceneObjects.scene, headSceneObjects.camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.5, // Strength of bloom
        0.5, // Radius
        0.5 // Threshold
    );
    composer.addPass(bloomPass);

    // Update the animation loop to use the composer
    headSceneObjects.renderer.setAnimationLoop(() => {
        composer.render();
    });

    return headSceneObjects;
}

document.addEventListener('mousemove', (event) => {
    if (!headSceneObjects || !headSceneObjects.camera) return;

    const { clientX, clientY } = event;
    const { innerWidth, innerHeight } = window;

    const rotationX = (clientY / innerHeight - 0.5) * 0.2; // Adjust rotation factor as needed
    const rotationY = (clientX / innerWidth - 0.5) * 0.2;

    headSceneObjects.camera.rotation.x = -rotationX;
    headSceneObjects.camera.rotation.y = -rotationY;
});

