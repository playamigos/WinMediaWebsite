import { THREE, setupScene, GLTFLoader } from './threeSetup.js';

let contactSceneObjects;

export function initContact() {
    const containerId = 'contact-section';
    contactSceneObjects = setupScene(containerId, (scene, camera, renderer) => {
        camera.position.set(0, 2, 5);
        camera.lookAt(0, 0, 0);

        const modelPromise = new Promise((resolve, reject) => {
            const loader = new GLTFLoader();
            loader.load(
                'scenes/Contact_scene.glb',
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
        scene.add(hemiLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(-3, 5, 2);
        scene.add(directionalLight);
    });

    if (contactSceneObjects) {
        // Wait for the model to load before starting animation
        contactSceneObjects.setupResult.then(model => {
            contactSceneObjects.animatedMesh = model;
            animateContact();
        }).catch(error => {
            console.error("Error loading model:", error);
        });
    } else {
        console.error("Failed to initialize contact scene.");
    }
    return contactSceneObjects;
}

function animateContact() {
    if (!contactSceneObjects || !contactSceneObjects.renderer || !contactSceneObjects.scene || !contactSceneObjects.camera) return;
    requestAnimationFrame(animateContact);

    if (contactSceneObjects.animatedMesh) {
        contactSceneObjects.animatedMesh.rotation.x += 0.003;
        contactSceneObjects.animatedMesh.rotation.y += 0.003;
        contactSceneObjects.animatedMesh.rotation.z += 0.003;
    }
    contactSceneObjects.composer.render();
}
