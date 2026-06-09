const express = require('express');
const cors = require('cors');
const runRoutes = require('./routes/runRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend is running');
});

// Mount Routes
app.use('/', runRoutes);

module.exports = app;
