// vimeoUploader.js

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { Vimeo } = require('vimeo');

const client = new Vimeo(
  process.env.VIMEO_CLIENT_ID,
  process.env.VIMEO_CLIENT_SECRET,
  process.env.VIMEO_ACCESS_TOKEN
);

console.log('VIMEO_ACCESS_TOKEN:', process.env.VIMEO_ACCESS_TOKEN);

// 🌐 Upload video file to Vimeo
const uploadToVimeo = async (filePath, title) => {
  const fileSize = fs.statSync(filePath).size;
  console.log(`📁 Uploading "${title}" (${(fileSize / (1024 * 1024)).toFixed(2)} MB)`);

  try {
    const uploadResult = await new Promise((resolve, reject) => {
      client.upload(
        filePath,
        {
          name: title,
          description: 'Uploaded via API',
        },
        function (uri) {
          console.log('✅ Video uploaded successfully. URI:', uri);
          resolve({ success: true, uri });
        },
        function (bytesUploaded, bytesTotal) {
          const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
          console.log(`⬆️ ${percentage}% uploaded...`);
        },
        function (error) {
          console.error('❌ Failed to upload to Vimeo:', error);
          reject({ success: false, error });
        }
      );
    });

    if (!uploadResult.success) throw new Error(uploadResult.error);

    const vimeoId = uploadResult.uri.split('/').pop(); // Extract ID from `/videos/12345678`
    return vimeoId;
  } catch (err) {
    console.error('🚨 Upload error:', err.message || err);
    throw err;
  }
};

// 📁 Set up multer for file uploads (local disk storage)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

const upload = multer({ storage });

module.exports = {
  uploadToVimeo,
  upload, // use as middleware: router.post(..., upload.single('video'), ...)
};
