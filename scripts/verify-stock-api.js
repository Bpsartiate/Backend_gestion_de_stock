#!/usr/bin/env node

/**
 * 🧪 SCRIPT DE VÉRIFICATION - API STOCK MOBILE
 * 
 * Ce script vérifie que tous les modèles et routes sont bien intégrés
 * Exécution: node scripts/verify-stock-api.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 VÉRIFICATION API STOCK MOBILE...\n');

// 1. Vérifier les modèles
console.log('📦 1. Vérification modèles Mongoose:');

const models = ['produit.js', 'stockMovement.js'];
models.forEach(model => {
  const filePath = path.join(__dirname, '../models', model);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${model}`);
  } else {
    console.log(`   ❌ ${model} - MANQUANT`);
  }
});

// 2. Vérifier les imports dans protected.js
console.log('\n🔗 2. Vérification imports dans protected.js:');

const protectedPath = path.join(__dirname, '../routes/protected.js');
const protectedContent = fs.readFileSync(protectedPath, 'utf8');

const requiredImports = [
  "const Produit = require('../models/produit');",
  "const StockMovement = require('../models/stockMovement');"
];

requiredImports.forEach(imp => {
  if (protectedContent.includes(imp)) {
    console.log(`   ✅ Import: ${imp.split("'")[1]}`);
  } else {
    console.log(`   ❌ Import manquant: ${imp}`);
  }
});

// 3. Vérifier les routes
console.log('\n🛣️  3. Vérification routes API:');

const routes = [
  '/magasins/:magasinId/produits (GET)',
  '/magasins/:magasinId/produits (POST)',
  '/produits/:produitId (PUT)',
  '/produits/:produitId (DELETE)',
  '/magasins/:magasinId/stock-movements (POST)',
  '/magasins/:magasinId/stock-movements (GET)',
  '/produits/:produitId/mouvements (GET)'
];

routes.forEach(route => {
  const [path, method] = route.split(' ');
  const pattern = method === '(GET)' ? `router.get('${path}'` :
                  method === '(POST)' ? `router.post('${path}'` :
                  method === '(PUT)' ? `router.put('${path}'` :
                  `router.delete('${path}'`;
  
  if (protectedContent.includes(pattern)) {
    console.log(`   ✅ ${route}`);
  } else {
    console.log(`   ⚠️  ${route} - À VÉRIFIER`);
  }
});

// 4. Vérifier api-config.js
console.log('\n⚙️  4. Vérification api-config.js:');

const apiConfigPath = path.join(__dirname, '../assets/js/api-config.js');
const apiConfigContent = fs.readFileSync(apiConfigPath, 'utf8');

const endpoints = ['PRODUITS', 'STOCK_MOVEMENTS', 'PRODUIT_MOUVEMENTS'];
endpoints.forEach(ep => {
  if (apiConfigContent.includes(`${ep}:`)) {
    console.log(`   ✅ Endpoint: ${ep}`);
  } else {
    console.log(`   ❌ Endpoint manquant: ${ep}`);
  }
});

// 5. Vérifier documentation
console.log('\n📚 5. Vérification documentation:');

const docs = [
  'API_STOCK_MOBILE.md',
  'API_STOCK_MOBILE_RESUME.md'
];

docs.forEach(doc => {
  const filePath = path.join(__dirname, '../docs', doc);
  if (fs.existsSync(filePath)) {
    const size = fs.statSync(filePath).size;
    console.log(`   ✅ ${doc} (${size} bytes)`);
  } else {
    console.log(`   ❌ ${doc} - MANQUANT`);
  }
});

console.log('\n✅ VÉRIFICATION COMPLÈTE!');
console.log('\n🚀 Prêt à tester:');
console.log('   1. Démarrer le serveur: npm start');
console.log('   2. Ouvrir Postman et importer les exemples');
console.log('   3. Tester les endpoints');
console.log('   4. Vérifier l\'app web et mobile\n');
