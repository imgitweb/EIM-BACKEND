const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Video = require("./models/courses/Video"); 
require("dotenv").config();

const autoLinkThumbnails = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    const thumbnailDir = path.join(__dirname, "uploads/thumbnails");
    const files = fs.readdirSync(thumbnailDir); // Folder ki saari files read karein

    const videos = await Video.find();
    console.log(`Found ${videos.length} videos. Matching files...`);

    for (const video of videos) {
      // 1. Title ko bilkul simple banayein (sirf letters aur numbers)
      const cleanTitle = video.title.toLowerCase().replace(/[^a-z0-9]/g, "");
      
      // 2. Folder ki files mein se match dhoondhein
      const match = files.find(file => {
        const cleanFileName = file.split('.')[0].toLowerCase().replace(/[^a-z0-9]/g, "");
        return cleanFileName === cleanTitle || cleanTitle.includes(cleanFileName) || cleanFileName.includes(cleanTitle);
      });

      if (match) {
        video.thumbnail = `uploads/thumbnails/${match}`;
        await video.save();
        console.log(`✨ SUCCESS: "${video.title}" matches "${match}"`);
      } else {
        // ✅ Default Fallback Logic
        // Pehle se folder mein ek 'default-premium.png' ya 'placeholder.jpg' rakhein
        video.thumbnail = `uploads/thumbnails/default-premium.png`; 
        await video.save();
        console.log(`⚠️ DEFAULT SET: Specific match not found for "${video.title}", set to default-premium.png`);
      }
    }

    console.log("🚀 Done! Closing connection...");
    await mongoose.connection.close();
  } catch (err) {
    console.error("❌ Error:", err);
  }
};

autoLinkThumbnails();