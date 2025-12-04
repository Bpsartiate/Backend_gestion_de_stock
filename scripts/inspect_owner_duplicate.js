require('dotenv').config();
const mongoose = require('mongoose');

async function run(){
  const uri = process.env.MONGODB_URI;
  if(!uri){ console.error('MONGODB_URI missing'); process.exit(1); }
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db;
  const coll = db.collection('businesses');

  const indexes = await coll.indexes();
  console.log('Indexes on businesses:', indexes);

  const ownerId = '691eebe005d8333cd988f743';
  const docs = await coll.find({ ownerId: new mongoose.Types.ObjectId(ownerId) }).toArray();
  console.log(`Documents with ownerId ${ownerId}: count=${docs.length}`);
  docs.forEach(d => console.log(d._id.toString(), d.nomEntreprise || d.name || 'no-name'));

  console.log('Attempting to insert a test business for that ownerId...');
  try{
    const res = await coll.insertOne({ ownerId: new mongoose.Types.ObjectId(ownerId), nomEntreprise: 'TEST DUP ' + Date.now(), email: 'test-dup@example.com' });
    console.log('Insert succeeded:', res.insertedId.toString());
    // cleanup
    await coll.deleteOne({ _id: res.insertedId });
    console.log('Cleanup done');
  }catch(err){
    console.error('Insert error:', err && err.message);
    if(err.code) console.error('Error code:', err.code);
    if(err.keyValue) console.error('keyValue:', err.keyValue);
  }

  await mongoose.disconnect();
  process.exit(0);
}

run();
