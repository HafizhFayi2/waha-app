require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

// Simple health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Webhook endpoint Waha
app.post('/webhook', async (req, res) => {
  const signature = req.headers['x-waha-signature'];
  if (signature !== process.env.WAHA_SECRET) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const payload = req.body;
  console.log('Incoming Waha event:', payload);

  // Forward to n8n Cloud
  try {
    await axios.post(
      process.env.N8N_WEBHOOK_URL,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.N8N_API_KEY}`
        }
      }
    );
    console.log('Forwarded to n8n');
  } catch (err) {
    console.error('Error forwarding to n8n:', err.message);
  }

  // Always respond 200 to Waha
  res.json({ received: true });
});

// Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Waha app listening on port ${PORT}`);
});
