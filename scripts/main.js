import { initHead } from './head.js';
import { initCaption } from './caption.js';
import { initServices } from './services.js';
import { initContact } from './contact.js';
import { initializeParticleSystem, handleMouseMoveForParticles, handleMouseClickForParticles, updateParticles } from './particleEffects.js';

// Store references to all initialized scene data
const sectionSceneData = {};
let animationFrameId;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all sections and collect their loading promises
    sectionSceneData.head = initHead();
    sectionSceneData.caption = initCaption();
    sectionSceneData.services = initServices();
    sectionSceneData.contact = initContact();

    // Collect all loading promises
    const loadingPromises = [
        sectionSceneData.head.setupResult,
        sectionSceneData.caption.setupResult,
        sectionSceneData.services.setupResult,
        sectionSceneData.contact.setupResult
    ];

    // Hide loader when all models are loaded
    Promise.all(loadingPromises)
        .then(() => {
            const loader = document.getElementById('loader');
            if (loader) {
                loader.style.display = 'none';
            }
        })
        .catch(error => {
            console.error('Error loading one or more models:', error);
            // Still hide the loader even if there's an error, but maybe show an error message
            const loader = document.getElementById('loader');
            if (loader) {
                loader.style.display = 'none';
            }
        });

    // Initialize the refactored particle system
    initializeParticleSystem();

    // Helper function to check if mouse is over an element
    function isMouseOverElement(event, element) {
        if (!element) return false;
        const rect = element.getBoundingClientRect();
        return event.clientX >= rect.left && event.clientX <= rect.right &&
               event.clientY >= rect.top && event.clientY <= rect.bottom;
    }

    // Event listener for mousemove
    window.addEventListener('mousemove', (event) => {
        let activeData = null;
        if (sectionSceneData.head && isMouseOverElement(event, sectionSceneData.head.container)) {
            activeData = sectionSceneData.head;
        } else if (sectionSceneData.caption && isMouseOverElement(event, sectionSceneData.caption.container)) {
            activeData = sectionSceneData.caption;
        } else if (sectionSceneData.services && isMouseOverElement(event, sectionSceneData.services.container)) {
            activeData = sectionSceneData.services;
        } else if (sectionSceneData.contact && isMouseOverElement(event, sectionSceneData.contact.container)) {
            activeData = sectionSceneData.contact;
        }

        if (activeData) {
            handleMouseMoveForParticles(event, activeData);
        }
    });

    // Event listener for click
    window.addEventListener('click', (event) => {
        let activeData = null;
        if (sectionSceneData.head && isMouseOverElement(event, sectionSceneData.head.container)) {
            activeData = sectionSceneData.head;
        } else if (sectionSceneData.caption && isMouseOverElement(event, sectionSceneData.caption.container)) {
            activeData = sectionSceneData.caption;
        } else if (sectionSceneData.services && isMouseOverElement(event, sectionSceneData.services.container)) {
            activeData = sectionSceneData.services;
        } else if (sectionSceneData.contact && isMouseOverElement(event, sectionSceneData.contact.container)) {
            activeData = sectionSceneData.contact;
        }

        if (activeData) {
            handleMouseClickForParticles(event, activeData);
        }
    });

    // Start the global animation loop
    animate();
});

// Global animation loop
function animate() {
    animationFrameId = requestAnimationFrame(animate);

    // Update particles
    updateParticles(); // This function now handles its own logic based on active scene context

    // Animate individual sections if they have their own animation loops
    // For example, if initHead() returned an animate function:
    if (sectionSceneData.head && sectionSceneData.head.animate) {
        sectionSceneData.head.animate();
    }
    if (sectionSceneData.caption && sectionSceneData.caption.animate) {
        sectionSceneData.caption.animate();
    }
    if (sectionSceneData.services && sectionSceneData.services.animate) {
        sectionSceneData.services.animate();
    }
    if (sectionSceneData.contact && sectionSceneData.contact.animate) {
        sectionSceneData.contact.animate();
    }
    // Render each scene - this should ideally be handled within each section's animate function
    // or if the renderer is shared and managed centrally, then here.
    // Based on the current setup, each section manages its own renderer.
    // So, rendering calls are likely within their respective animate functions.
}

// Optional: Add a way to stop the animation loop if needed, e.g., when the tab is not visible.
// document.addEventListener('visibilitychange', () => {
//     if (document.hidden) {
//         cancelAnimationFrame(animationFrameId);
//     } else {
//         animate();
//     }
// });
