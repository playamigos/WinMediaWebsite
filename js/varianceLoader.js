function loadImageVariance(baseName, variants, position) {
    let options = [];
    for (const item of variants) {
      if (typeof item === 'number') options.push(item);
      else if (typeof item === 'string' && item.includes(':')) {
        const [start, end] = item.split(':').map(Number);
        for (let i = start; i <= end; i++) options.push(i);
      }
    }
    const pick = options[Math.floor(Math.random() * options.length)];
    loadImagePlane(`${baseName}_${pick}.png`, position, `${baseName}_${pick}`);
  }