#!/usr/bin/env node
const { connectDB, mongoose } = require('../config/db');
const Business = require('../models/business');

async function run() {
  const apply = process.argv.includes('--apply');
  console.log(`Dedupe business script (apply=${apply})`);
  await connectDB();

  // Find ownerIds with more than one business
  const duplicates = await Business.aggregate([
    { $group: { _id: '$ownerId', count: { $sum: 1 }, ids: { $push: '$_id' } } },
    { $match: { count: { $gt: 1 } } }
  ]);

  if (!duplicates.length) {
    console.log('Aucun doublon trouvé.');
    process.exit(0);
  }

  console.log(`Found ${duplicates.length} owner(s) with duplicates`);

  const backupColl = mongoose.connection.collection('business_backups');
  let totalRemoved = 0;

  for (const group of duplicates) {
    const ownerId = group._id;
    const docs = await Business.find({ ownerId }).sort({ updatedAt: -1, createdAt: -1 }).lean();
    if (docs.length <= 1) continue;

    // Keep the most recently updated (first), archive others
    const [keep, ...others] = docs;
    console.log(`Owner ${ownerId}: keep ${keep._id}, duplicates: ${others.map(d => d._id).join(', ')}`);

    // Backup duplicates
    const ts = new Date();
    const backups = others.map(d => ({ ...d, _originalId: d._id, archivedAt: ts }));
    await backupColl.insertMany(backups);

    if (apply) {
      const otherIds = others.map(d => d._id);
      const res = await Business.deleteMany({ _id: { $in: otherIds } });
      totalRemoved += res.deletedCount || 0;
      console.log(`Removed ${res.deletedCount || 0} duplicate(s) for owner ${ownerId}`);
    }
  }

  console.log(`Done. totalRemoved=${totalRemoved}. Backups written to collection 'business_backups'.`);
  if (!apply) console.log('Dry-run mode: to actually remove duplicates run with --apply');
  process.exit(0);
}

run().catch(err => {
  console.error('Deduplicate error:', err);
  process.exit(2);
});
