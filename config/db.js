const mongoose = require("mongoose");

/**
 * Remove duplicates for a specific unique index
 */
async function removeDuplicatesForUniqueIndex(collection, index) {
  const fields = Object.keys(index.key);
  if (!fields.length) return 0;

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

  let deleted = 0;

  for (const doc of duplicates) {
    const idsToDelete = doc.ids.slice(1); // keep first document
    const res = await collection.deleteMany({ _id: { $in: idsToDelete } });
    deleted += res.deletedCount || 0;
  }

  return deleted;
}

/**
 * Cleanup duplicates ONLY for selected collections & indexes
 * ❌ Never runs automatically in production
 */
async function runDuplicateCleanup() {
  const db = mongoose.connection.db;

  // 👇 SAFE LIST (edit only if needed)
  const TARGET_INDEXES = {
    mentors: ["email_1"],
    investors: ["phone_1"],
    categories: ["name_1"],
  };

  for (const [collectionName, indexNames] of Object.entries(TARGET_INDEXES)) {
    const collection = db.collection(collectionName);
    const indexes = await collection.indexes();

    for (const indexName of indexNames) {
      const index = indexes.find((i) => i.name === indexName && i.unique);
      if (!index) continue;

      console.log(`🔍 Cleaning ${collectionName} -> ${indexName}`);
      const deleted = await removeDuplicatesForUniqueIndex(collection, index);
      console.log(`🧹 Removed ${deleted} duplicates`);
    }
  }
}

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected successfully");

    /**
     * ⚠️ VERY IMPORTANT
     * Duplicate cleanup runs ONLY when explicitly enabled
     */
    if (
      process.env.RUN_DB_CLEANUP === "true" &&
      process.env.NODE_ENV !== "production"
    ) {
      console.log("🧹 Running controlled duplicate cleanup...");
      await runDuplicateCleanup();
      console.log("✅ Duplicate cleanup completed");
    }
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
};

module.exports = connectDB;

