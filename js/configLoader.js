async function loadConfig(url) {
      const res = await fetch(url);
      const data = await res.json();

    for (const img of data.images) {
        if (img.shader) loadDeformImage(img.url, img.position, img.name);
        else {
            loadImagePlane(img.url, img.position, img.name);
            const obj = scene.getObjectByName(img.name);
            if (img.onClick) obj.userData.onClick = img.onClick;
        }
    }
    for (const txt of data.texts) {
        loadText(txt.text, txt.position, txt.name);
        const obj = scene.getObjectByName(txt.name);
        if (txt.onClick) obj.userData.onClick = txt.onClick;
    }
    for (const gif of data.gifs) loadGifPlane(gif.url, gif.position, gif.name);
}