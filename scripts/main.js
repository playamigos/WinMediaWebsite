import { initHead } from './head.js';

document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.display = 'block';
    }

    // Initialize the 3D head scene on the home page
    const headSceneData = initHead();

    // Wait for the scene to fully load
    Promise.resolve(headSceneData).then(() => {
        if (loader) {
            loader.style.display = 'none';
        }
    }).catch(error => {
        console.error('Error loading the scene:', error);
        if (loader) {
            loader.style.display = 'none';
        }
    });
});

