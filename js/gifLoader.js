function loadGifPlane(url, position, name) {
    fetch(url)
      .then(res => res.arrayBuffer())
      .then(buffer => {
        const gif = gifuct.parseGIF(buffer);
        const frames = gifuct.decompressFrames(gif, true);
  
        const textures = frames.map(frame => {
          const canvas = document.createElement("canvas");
          canvas.width = frame.dims.width;
          canvas.height = frame.dims.height;
          const ctx = canvas.getContext("2d");
          const imgData = ctx.createImageData(frame.dims.width, frame.dims.height);
          imgData.data.set(frame.patch);
          ctx.putImageData(imgData, 0, 0);
          return new THREE.CanvasTexture(canvas);
        });
  
        const mat = new THREE.MeshBasicMaterial({ map: textures[0], transparent: true });
        const geo = new THREE.PlaneGeometry(1, 1);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(...position);
        mesh.name = name;
        mesh.tick = (t) => {
          const frame = Math.floor((t * 10) % textures.length);
          mat.map = textures[frame];
          mat.needsUpdate = true;
        };
        scene.add(mesh);
      });
  }