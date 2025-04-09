function loadText(text, position, name) {
    const loader = new THREE.FontLoader();
    loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
      const geometry = new THREE.TextGeometry(text, {
        font: font,
        size: 0.3,
        height: 0.05,
      });
      const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...position);
      mesh.name = name;
      scene.add(mesh);
    });
  }