import { THREE, setupScene, GLTFLoader } from './threeSetup.js';

// Module-level variable to store all scene objects and the animated mesh
let headSceneObjects;

export function initHead() {
    const containerId = 'head-section';
    // setupScene now returns an object which we store in headSceneObjects
    // The callback is used for scene-specific configurations
    headSceneObjects = setupScene(containerId, (scn, cam, rend) => {
        // Position camera appropriately for the scene
        cam.position.set(0, 2, 5);
        cam.lookAt(0, 0, 0);

        // Create a promise that will resolve with the loaded model
        const modelPromise = new Promise((resolve, reject) => {
            const loader = new GLTFLoader();
            loader.load(
                'scenes/Head_scene.glb',
                (gltf) => {
                    const model = gltf.scene;
                    // Center the model
                    const box = new THREE.Box3().setFromObject(model);
                    const center = box.getCenter(new THREE.Vector3());
                    model.position.sub(center);
                    scn.add(model);
                    resolve(model);
                },
                undefined,
                reject
            );
        });

        // Add lights suitable for PBR materials
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 1, 1).normalize();
        scn.add(directionalLight);

        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
        scn.add(hemiLight);

        // Return the promise that will resolve with the model
        return modelPromise;
    });

    if (headSceneObjects) {
        // Wait for the model to load before starting animation
        headSceneObjects.setupResult.then(model => {
            headSceneObjects.animatedMesh = model;
            // If setupScene was successful and model is loaded, proceed to animate
            animateHead();
        }).catch(error => {
            console.error("Error loading model:", error);
        });
    } else {
        console.error("Failed to initialize head scene.");
    }
    return headSceneObjects; // Return the object containing scene, camera, renderer, and animatedMesh
}

function animateHead() {
    // Ensure all necessary components are available before proceeding
    if (!headSceneObjects || !headSceneObjects.renderer || !headSceneObjects.scene || !headSceneObjects.camera) {
        // console.warn("Head animation skipped: scene objects not ready.");
        return;
    }
    requestAnimationFrame(animateHead);

    if (headSceneObjects.animatedMesh) {
        headSceneObjects.animatedMesh.rotation.x += 0.01;
        headSceneObjects.animatedMesh.rotation.y += 0.01;
    }
    headSceneObjects.composer.render();
}
