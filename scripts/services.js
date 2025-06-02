import { THREE, setupScene, GLTFLoader } from './threeSetup.js';

let servicesSceneObjects;

export function initServices() {
    const containerId = 'services-section';
    servicesSceneObjects = setupScene(containerId, (scene, camera, renderer) => {
        camera.position.set(0, 2, 5);
        camera.lookAt(0, 0, 0);

        const modelPromise = new Promise((resolve, reject) => {
            const loader = new GLTFLoader();
            loader.load(
                'scenes/Services_scene.glb',
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

    if (servicesSceneObjects) {
        // Wait for the model to load before starting animation
        servicesSceneObjects.setupResult.then(model => {
            servicesSceneObjects.animatedMesh = model;
            animateServices();
        }).catch(error => {
            console.error("Error loading model:", error);
        });
    } else {
        console.error("Failed to initialize services scene.");
    }
    return servicesSceneObjects;
}

function animateServices() {
    if (!servicesSceneObjects || !servicesSceneObjects.renderer || !servicesSceneObjects.scene || !servicesSceneObjects.camera) return;
    requestAnimationFrame(animateServices);

    if (servicesSceneObjects.animatedMesh) {
        servicesSceneObjects.animatedMesh.rotation.x += 0.01;
        servicesSceneObjects.animatedMesh.rotation.y -= 0.007;
    }
    servicesSceneObjects.composer.render();
}
