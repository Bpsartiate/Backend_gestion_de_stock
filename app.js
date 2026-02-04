const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const utilisateurRoutes = require('./routes/auth');
const protectedRoutes = require('./routes/protected');
const ventesRoutes = require('./routes/ventes');
const commandesRoutes = require('./routes/commandes');
const fournisseurRatingRoutes = require('./routes/fournisseurRating');
const businessRoutes = require('./routes/business'); // routes pour profil entrepris
const path = require('path');

require('dotenv').config();

const app = express();

app.use(cors());
// Augmenter les limites pour les uploads d'images
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Serve uploaded files (MUST be before routes)
const uploadsPath = path.join(__dirname, 'public', 'uploads');
console.log('[app] serving static files from:', uploadsPath);
app.use('/uploads', express.static(uploadsPath));

// diagnostic route to check if files exist
app.get('/api/test-uploads', (req, res) => {
  const fs = require('fs');
  try {
    const files = fs.readdirSync(uploadsPath);
    res.json({ uploadsPath, files, exists: true });
  } catch (e) {
    res.json({ uploadsPath, error: e.message, exists: false });
  }
});

app.use('/api/auth', utilisateurRoutes);
app.use('/api/protected', protectedRoutes);
app.use('/api/protected', ventesRoutes);
app.use('/api/protected', commandesRoutes);
app.use('/api/protected', fournisseurRatingRoutes);
app.use('/api/business', businessRoutes);
// Activity routes mounted under business path (mergeParams used in router)
app.use('/api/business/:businessId/activities', require('./routes/activity'));

app.get('/', (req, res) => {
  res.json({ message: 'API backend opérationnelle' });
});

module.exports = app;
