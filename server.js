require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 3000;

// Centralized DB connection
connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Serveur lancé sur le port ${PORT}`));
  })
  .catch((err) => {
    console.error('Erreur de connexion MongoDB:', err);
    process.exit(1);
  });
