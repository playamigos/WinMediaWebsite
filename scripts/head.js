import { setupScene } from './threeSetup.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as THREE from 'three';

// Module-level variable to store all scene objects and the animated mesh
let headSceneObjects;

export function initHead() {
    const containerId = 'head-section';
    headSceneObjects = setupScene(containerId);

    // Load the GLTF model
    const loader = new GLTFLoader();
    loader.load('scenes/Head_scene.glb', (gltf) => {
        const model = gltf.scene;
        induceSceneChanges(model);
        headSceneObjects.scene.add(model);
    }, undefined, (error) => {
        console.error('An error occurred while loading the GLTF model:', error);
    });

    // Add ambient light to the scene
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Adjust intensity as needed
    headSceneObjects.scene.add(ambientLight);
   

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


function induceSceneChanges(model) {
    //add emissive to a material in the scene by particular material name
    model.traverse((child) => {
        if (child.isMesh) {
            //check if material supports emissive
            if (child.material && child.material.emissive) {
                child.material.emissiveIntensity = 1.2; // Set emissive intensity
            }
        }
    });


}


