const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const utilisateurRoutes = require('./routes/auth');
const protectedRoutes = require('./routes/protected');

require('dotenv').config();

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/auth', utilisateurRoutes);
app.use('/api/protected', protectedRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API backend opérationnelle' });
});

module.exports = app;
