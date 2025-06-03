import { initHead } from './head.js';

document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.display = 'block';
    }

    const headSceneData = initHead();

    // Wait for the scene to fully load
    Promise.resolve(headSceneData.setupResult).then(() => {
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

