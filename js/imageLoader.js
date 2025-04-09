function loadImagePlane(url, position, name) {
    const tex = new THREE.TextureLoader().load(url);
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
    const geo = new THREE.PlaneGeometry(1, 1);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(...position);
    mesh.name = name;
    scene.add(mesh);
  }