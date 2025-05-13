const express = require("express");
const Document = require("../models/resourceModel");

module.exports = (upload) => {
  const router = express.Router();

  // API to upload document
  router.post("/upload", upload.single("doc"), async (req, res) => {
    const { name } = req.body;
    const doc = req.file ? req.file.path : "";

    try {
      const newDocument = new Document({ name, doc });
      await newDocument.save();
      res.status(200).json({
        message: "Document uploaded successfully",
        document: newDocument,
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to upload document" });
    }
  });

  // API to get the list of documents
  router.get("/", async (req, res) => {
    try {
      const documents = await Document.find();
      res.status(200).json(documents);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  return router;
};
