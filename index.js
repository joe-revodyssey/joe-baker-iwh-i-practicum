require('dotenv').config();
console.log('Token loaded:', process.env.HUBSPOT_API_KEY ? 'Yes' : 'No');

const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000;

// HubSpot custom object internal name
const HUBSPOT_OBJECT = '2-192760707';

// Middleware
app.use(express.urlencoded({ extended: true })); // To read form data
app.use(express.json());
app.set('view engine', 'pug');

// GET / → Homepage showing all voyages
app.get('/', async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.hubapi.com/crm/v3/objects/${HUBSPOT_OBJECT}?properties=voyage_name,captain,crew_count,home_port,vessel_name&limit=100`,
      {
        headers: { Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}` }
      }
    );

    const records = response.data.results;
    res.render('homepage', { records });
  } catch (err) {
    console.error('HubSpot API Error:', err.response?.data || err.message);
    res.status(500).send('Error fetching voyage records');
  }
});

// GET /update-cobj → Render the form
app.get('/update-cobj', (req, res) => {
  res.render('updates', {
    title: 'Update Voyages | Integrating With HubSpot I Practicum'
  });
});

// POST /update-cobj → Create a new voyage
app.post('/update-cobj', async (req, res) => {
  const { voyage_name, captain, crew_count, home_port, vessel_name} = req.body;

  try {
    await axios.post(
      `https://api.hubapi.com/crm/v3/objects/${HUBSPOT_OBJECT}`,
      { properties: { voyage_name, captain, crew_count, home_port, vessel_name} },
      {
        headers: { Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}` }
      }
    );

    res.redirect('/');
  } catch (err) {
    console.error('HubSpot API Error:', err.response?.data || err.message);
    res.status(500).send('Error creating voyage record');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});