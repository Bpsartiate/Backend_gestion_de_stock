#!/usr/bin/env node
/**
 * Drop unique index on remote MongoDB
 * Usage: MONGODB_URI="your_remote_uri" node scripts/drop_remote_index.js
 * Or hardcode the URI below and run: node scripts/drop_remote_index.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function dropRemoteIndex() {
  // Try to get URI from environment, command line, or ask user
  let uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('MONGODB_URI not found in .env');
    console.log('\nTo drop the index on your remote MongoDB:');
    console.log('Option 1: Set MONGODB_URI in .env and run this script');
    console.log('Option 2: Run with explicit URI:');
    console.log('  MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/dbname" node scripts/drop_remote_index.js');
    console.log('\nOption 3: Use MongoDB Atlas UI to drop the index manually:');
    console.log('  1. Go to mongodb.com/cloud/atlas');
    console.log('  2. Select your cluster');
    console.log('  3. Go to Collections → geststock → businesses');
    console.log('  4. Find "ownerId_1" index and click Delete');
    process.exit(1);
  }

  try {
    console.log('Connecting to remote MongoDB...');
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✓ Connected to remote MongoDB');

    const db = mongoose.connection.db;
    const coll = db.collection('businesses');

    console.log('\n📋 Current indexes on "businesses" collection:');
    const indexes = await coll.indexes();
    indexes.forEach((ix, i) => {
      console.log(`  ${i + 1}. ${ix.name || 'unnamed'} - ${JSON.stringify(ix.key)}`);
    });

    // Find and drop ownerId_1 index
    const ownerIndex = indexes.find(ix => ix.name === 'ownerId_1' || (ix.key && ix.key.ownerId === 1));
    
    if (!ownerIndex) {
      console.log('\n✓ No ownerId_1 index found. Nothing to drop.');
      await mongoose.disconnect();
      process.exit(0);
    }

    console.log(`\n🗑️  Dropping index: ${ownerIndex.name || 'ownerId_1'}`);
    await coll.dropIndex(ownerIndex.name || 'ownerId_1');
    console.log('✓ Index dropped successfully!');

    console.log('\n📋 Indexes after drop:');
    const newIndexes = await coll.indexes();
    newIndexes.forEach((ix, i) => {
      console.log(`  ${i + 1}. ${ix.name || 'unnamed'} - ${JSON.stringify(ix.key)}`);
    });

    await mongoose.disconnect();
    console.log('\n✓ Done!');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Error:', err.message);
    console.log('\nTroubleshooting:');
    console.log('- Verify MONGODB_URI is correct');
    console.log('- Check network connectivity to MongoDB');
    console.log('- Ensure you have permission to modify indexes');
    try { await mongoose.disconnect(); } catch (e) {}
    process.exit(1);
  }
}

dropRemoteIndex();
