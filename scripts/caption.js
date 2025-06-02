import { THREE, setupScene, GLTFLoader } from './threeSetup.js';

let captionSceneObjects;

export function initCaption() {
    const containerId = 'caption-section';
    captionSceneObjects = setupScene(containerId, (scene, camera, renderer) => {
        camera.position.set(0, 2, 5);
        camera.lookAt(0, 0, 0);

        const modelPromise = new Promise((resolve, reject) => {
            const loader = new GLTFLoader();
            loader.load(
                'scenes/Caption_scene.glb',
                (gltf) => {
                    const model = gltf.scene;
                    // Center the model
                    const box = new THREE.Box3().setFromObject(model);
                    const center = box.getCenter(new THREE.Vector3());
                    model.position.sub(center);
                    scene.add(model);
                    resolve(model);
                },
                undefined,
                reject
            );
        });

        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
        scene.add(hemiLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.position.set(1, 1, 1).normalize();
        scene.add(dirLight);

        return modelPromise;
    });

    if (captionSceneObjects) {
        // Wait for the model to load before starting animation
        captionSceneObjects.setupResult.then(model => {
            captionSceneObjects.animatedMesh = model;
            animateCaption();
        }).catch(error => {
            console.error("Error loading model:", error);
        });
    } else {
        console.error("Failed to initialize caption scene.");
    }
    return captionSceneObjects;
}

function animateCaption() {
    if (!captionSceneObjects || !captionSceneObjects.renderer || !captionSceneObjects.scene || !captionSceneObjects.camera) return;
    requestAnimationFrame(animateCaption);

    if (captionSceneObjects.animatedMesh) {
        captionSceneObjects.animatedMesh.rotation.x += 0.005;
        captionSceneObjects.animatedMesh.rotation.y += 0.005;
    }
    captionSceneObjects.composer.render();
}
