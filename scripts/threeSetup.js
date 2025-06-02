import * as _THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// Export THREE and GLTFLoader to be available for other modules
export { _THREE as THREE, GLTFLoader, EffectComposer, RenderPass, UnrealBloomPass };

// This function now returns the scene, camera, renderer, controls, composer, and container
export function setupScene(containerId, optionalSceneConfigurationCallback = () => {}) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with id ${containerId} not found.`);
        return null; // Return null or throw error if container not found
    }

    const scene = new _THREE.Scene();
    const camera = new _THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    // Position camera or let the specific scene setup do it
    // camera.position.z = 5; 

    const renderer = new _THREE.WebGLRenderer({ 
        antialias: true,
        powerPreference: "high-performance",
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 1);
    renderer.outputEncoding = _THREE.sRGBEncoding;
    // renderer.toneMapping = _THREE.ACESFilmicToneMapping;  // Better HDR rendering
    // renderer.toneMappingExposure = 0.7;  // Slightly increased exposure
    container.appendChild(renderer.domElement);

    // Setup post-processing
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    // Add bloom effect with adjusted parameters for selective bloom
    const bloomPass = new UnrealBloomPass(
        new _THREE.Vector2(container.clientWidth, container.clientHeight),
        1.2,    // strength - slightly stronger for emissive materials
        0.75,   // radius - wider radius for softer glow
        0.9     // threshold - much higher to only catch emissive materials
    );
    
    // Fine-tune bloom parameters
    bloomPass.threshold = 0.9;        // Only very bright areas will glow
    bloomPass.strength = 1.2;         // Intensity of the glow
    bloomPass.radius = 0.75;          // How far the glow spreads
    composer.addPass(bloomPass);

    // Basic ambient light, can be configured/overridden by optionalSceneConfigurationCallback
    const ambientLight = new _THREE.AmbientLight(0xffffff, 0.8);  // Slightly reduced intensity
    scene.add(ambientLight);

    // Optional: Add OrbitControls or other general setup here if needed by all scenes
    // let controls = null;
    // if (_THREE.OrbitControls) { // Check if OrbitControls is available if you decide to use it
    //     controls = new _THREE.OrbitControls(camera, renderer.domElement);
    //     controls.enableDamping = true;
    // }

    // Optional: Post-processing composer, can be configured/overridden
    // let composer = null;
    // if (_THREE.EffectComposer && _THREE.RenderPass && _THREE.UnrealBloomPass) { // Check for availability
    //     composer = new _THREE.EffectComposer(renderer);
    //     composer.addPass(new _THREE.RenderPass(scene, camera));
    //     // Example: add a bloom pass, specific scenes can customize or remove
    //     // const bloomPass = new _THREE.UnrealBloomPass(new _THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    //     // composer.addPass(bloomPass);
    // }

    // Call the callback for scene-specific configurations and get any setup result
    let setupResult = optionalSceneConfigurationCallback(scene, camera, renderer, composer);

    // Handle window resize
    function onWindowResize() {
        if (container) { // Check if container is still valid
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
            composer.setSize(container.clientWidth, container.clientHeight);
            // Update bloom pass size
            if (bloomPass) {
                bloomPass.resolution.set(container.clientWidth, container.clientHeight);
            }
        }
    }
    window.addEventListener('resize', onWindowResize, false);

    // Return all relevant objects for the caller to manage
    return { scene, camera, renderer, composer, container, setupResult, dispose: () => {
        window.removeEventListener('resize', onWindowResize);
        if(renderer) renderer.dispose();
        // container.removeChild(renderer.domElement); // Or let the caller handle this
        // Dispose other THREE objects if necessary
    }};
}
