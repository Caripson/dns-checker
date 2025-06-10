const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  next();
});

// Start a new leak test
app.get('/api/start', async (req, res) => {
  try {
    const html = await fetch('https://bash.ws/dnsleak/test').then(r => r.text());
    const match = html.match(/id="leak-id"\s+name="leak-id"\s+value="([^"]+)"/);
    if (!match) return res.status(500).json({ error: 'Failed to get leak id' });
    const id = match[1];
    // Trigger the test on bash.ws
    await fetch(`https://bash.ws/dnsleak/test/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'ajax=1&delete=1'
    });
    res.json({ id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'start failed' });
  }
});

// Retrieve results
app.get('/api/result', async (req, res) => {
  const id = req.query.id;
  if (!id) return res.status(400).json({ error: 'id required' });
  try {
    const json = await fetch(`https://bash.ws/dnsleak/test/${id}?json`).then(r => r.text());
    res.type('application/json').send(json);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'fetch failed' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
