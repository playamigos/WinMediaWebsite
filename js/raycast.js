const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let INTERSECTED;

window.addEventListener('mousemove', e => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener('click', () => {
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children);
  if (intersects.length > 0) {
    const obj = intersects[0].object;
    if (obj.userData.onClick) eval(obj.userData.onClick);
  }
});

function highlightOnHover() {
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children);
  if (intersects.length > 0) {
    const obj = intersects[0].object;
    if (INTERSECTED !== obj) {
      if (INTERSECTED) INTERSECTED.scale.set(1, 1, 1);
      INTERSECTED = obj;
      INTERSECTED.scale.set(1.1, 1.1, 1.1);
    }
  } else {
    if (INTERSECTED) INTERSECTED.scale.set(1, 1, 1);
    INTERSECTED = null;
  }
}