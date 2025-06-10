async function checkResolver() {
  const statusDiv = document.getElementById('status');
  statusDiv.className = 'text-large';
  statusDiv.textContent = 'Checking...';
  try {
    const start = await fetch('/api/start').then(r => r.json());
    if (!start.id) throw new Error('start failed');
    const id = start.id;
    // trigger DNS queries via images
    for (let i = 0; i < 10; i++) {
      const img = new Image();
      img.src = `https://ex.${i}.${id}.bash.ws/css/z.css`;
    }
    await new Promise(r => setTimeout(r, 3000));
    const results = await fetch(`/api/result?id=${id}`).then(r => r.json());
    const resolvers = results.filter(e => e.type === 'dns').map(e => e.ip);
    statusDiv.textContent = 'Resolvers: ' + (resolvers.join(', ') || 'none');
  } catch (err) {
    statusDiv.textContent = 'Error performing test';
  }
}

document.getElementById('checkBtn').addEventListener('click', checkResolver);
