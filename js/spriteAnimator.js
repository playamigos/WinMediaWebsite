function loadSpriteSheet(url, frames, cols, rows, position, name) {
    const texture = new THREE.TextureLoader().load(url);
    texture.repeat.set(1 / cols, 1 / rows);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  
    const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    const geo = new THREE.PlaneGeometry(1, 1);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(...position);
    mesh.name = name;
  
    mesh.tick = (t) => {
      const frame = Math.floor(t * 10) % frames;
      const col = frame % cols;
      const row = Math.floor(frame / cols);
      texture.offset.set(col / cols, 1 - (row + 1) / rows);
    };
  
    scene.add(mesh);
  }