import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';

function blenderWattsToCandela(watts) {
    watts = watts/1000;
    return (683 * watts) / (4 * Math.PI);
}

export function setupScene(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with id ${containerId} not found.`);
        return null;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 3.8;

    const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        useLegacyLights: true,
        powerPreference: "high-performance"
    });
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.2;
    
    // Set pixel ratio for better quality on high-DPI displays
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.7,
        0.2,
        0.1
    );
    composer.addPass(bloomPass);

    // Add SMAA pass for higher quality anti-aliasing
    const smaaPass = new SMAAPass(
        container.clientWidth * renderer.getPixelRatio(),
        container.clientHeight * renderer.getPixelRatio()
    );
    composer.addPass(smaaPass);

    // Add FXAA pass as a fallback
    const fxaaPass = new ShaderPass(FXAAShader);
    const pixelRatio = renderer.getPixelRatio();
    fxaaPass.material.uniforms['resolution'].value.set(
        1 / (container.clientWidth * pixelRatio),
        1 / (container.clientHeight * pixelRatio)
    );
    composer.addPass(fxaaPass);

    // Update handler for window resize
    window.addEventListener('resize', () => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        
        renderer.setSize(width, height);
        composer.setSize(width, height);
        
        const pixelRatio = renderer.getPixelRatio();
        bloomPass.resolution.set(width, height);
        fxaaPass.material.uniforms['resolution'].value.set(
            1 / (width * pixelRatio),
            1 / (height * pixelRatio)
        );
        smaaPass.setSize(width * pixelRatio, height * pixelRatio);
    });

    const animate = function () {
        requestAnimationFrame(animate);
        composer.render();
    };

    animate();

    return { 
        scene, 
        camera, 
        renderer,
        convertLightIntensities: (model) => {
            model.traverse((child) => {
                if (child.isLight) {
                    child.intensity = blenderWattsToCandela(child.intensity);
                }
            });
        }
    };
}
