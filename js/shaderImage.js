function loadDeformImage(url, position, name) {
    const tex = new THREE.TextureLoader().load(url);
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        texture1: { value: tex },
        time: { value: 0 }
      },
      vertexShader: document.getElementById("vertexShader").textContent,
      fragmentShader: document.getElementById("fragmentShader").textContent,
      transparent: true
    });
  
    const geo = new THREE.PlaneGeometry(1, 1, 32, 32);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(...position);
    mesh.name = name;
    mesh.tick = (t) => {
      mat.uniforms.time.value = t;
    };
    scene.add(mesh);
  }