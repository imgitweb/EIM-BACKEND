const mongoose = require("mongoose");

async function removeDuplicatesForUniqueIndex(collection, index) {
  const keys = index.key; // e.g. { startup_id: 1, activity_schema: 1 }
  const fields = Object.keys(keys);

  if (!fields.length) return 0;

  // build group _id from index fields
  const groupId = {};
  fields.forEach((f) => (groupId[f] = `$${f}`));

  const duplicates = await collection
    .aggregate([
      {
        $group: {
          _id: groupId,
          ids: { $push: "$_id" },
          count: { $sum: 1 },
        },
      },
      { $match: { count: { $gt: 1 } } },
    ])
    .toArray();

  let totalDeleted = 0;

  for (const doc of duplicates) {
    const idsToDelete = doc.ids.slice(1); // keep first
    const res = await collection.deleteMany({ _id: { $in: idsToDelete } });
    totalDeleted += res.deletedCount || 0;
  }

  return totalDeleted;
}

async function cleanupAllCollectionsDuplicates() {
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();

  console.log(`📌 Total Collections Found: ${collections.length}`);

  for (const col of collections) {
    const colName = col.name;
    const collection = db.collection(colName);

    const indexes = await collection.indexes();
    const uniqueIndexes = indexes.filter((idx) => idx.unique);

    if (!uniqueIndexes.length) continue;

    console.log(`\n🔍 Collection: ${colName}`);
    console.log(`✅ Unique indexes found: ${uniqueIndexes.length}`);

    for (const idx of uniqueIndexes) {
      // Skip default _id_ index
      if (idx.name === "_id_") continue;

      console.log(`➡️ Checking index: ${idx.name} ->`, idx.key);

      const deleted = await removeDuplicatesForUniqueIndex(collection, idx);

      if (deleted > 0) {
        console.log(`🧹 Removed duplicates: ${deleted} for index: ${idx.name}`);
      } else {
        console.log(`✅ No duplicates for index: ${idx.name}`);
      }

      // Ensure index still exists
      try {
        await collection.createIndex(idx.key, { unique: true, name: idx.name });
        console.log(`🔒 Unique index ensured: ${idx.name}`);
      } catch (e) {
        console.log(`⚠️ Could not ensure index ${idx.name}:`, e.message);
      }
    }
  }

  console.log("\n🎉 All Collections Cleanup Completed!");
}

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected successfully");

    // ✅ Run universal cleanup
    await cleanupAllCollectionsDuplicates();
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
};

module.exports = connectDB;
