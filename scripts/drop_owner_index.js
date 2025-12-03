// scripts/drop_owner_index.js
// Drops the ownerId unique/index on the `businesses` collection if it exists.
// Usage: set MONGODB_URI in your .env then run `node scripts/drop_owner_index.js`

require('dotenv').config();
const mongoose = require('mongoose');

async function run(){
  const uri = process.env.MONGODB_URI;
  if(!uri){
    console.error('MONGODB_URI not found in environment. Add it to .env or export it.');
    process.exit(1);
  }

  try{
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const coll = db.collection('businesses');

    const indexes = await coll.indexes();
    console.log('Current indexes on `businesses`:', indexes);

    // find index named ownerId_1 or index with keyPattern ownerId:1
    const ownerIndex = indexes.find(ix => ix.name === 'ownerId_1' || (ix.key && ix.key.ownerId===1));
    if(!ownerIndex){
      console.log('No ownerId index found. Nothing to drop.');
      await mongoose.disconnect();
      process.exit(0);
    }

    console.log('Dropping index:', ownerIndex.name || ownerIndex);
    await coll.dropIndex(ownerIndex.name || 'ownerId_1');
    console.log('Index dropped. Current indexes:');
    console.log(await coll.indexes());

    await mongoose.disconnect();
    process.exit(0);
  }catch(err){
    console.error('Error while dropping index:', err && (err.message || err));
    try{ await mongoose.disconnect(); }catch(e){}
    process.exit(1);
  }
}

run();
