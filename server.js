const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const https = require("https");
const fs = require("fs");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const teamRoutes = require("./routes/teamRoutes");
const companyRoutes = require("./routes/companyRoutes");
const documentRoutes = require("./routes/documentRoutes");
const matrixRoutes = require("./routes/matrixRoutes");
const leadRoutes = require("./routes/leadRoutes");
const jobRequestRoutes = require("./routes/jobRequestRoutes");
const todoRoutes = require("./routes/todoRoutes");
const startupRoutes = require("./routes/startupRoutes");
const pathToUnicorn = require("./routes/pathToUnicorn");
const resourceRoutes = require("./routes/resourceRoutes");
const messageRoutes = require("./routes/messageRoutes");
const adminRoutes = require("./routes/adminRoutes");
const investorRoutes = require("./routes/investorRoutes");
const mentorRoutes = require("./routes/mentorRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const templateRoute = require("./routes/templateRoute");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure CORS based on environment
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? ["https://app.incubationmasters.com", "https://incubationmasters.com","http://localhost:3000","https://admin.incubationmasters.com"] // Production origin
    : ["http://localhost:3000", "http://localhost:3001","http://localhost:5173"]; // Development origin

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Connect to Database
connectDB();

// Multer Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine the upload directory based on the route
    let uploadDir = "uploads";

    if (req.originalUrl.includes("/api/investors")) {
      uploadDir = "uploads/investors";
    } else {
      uploadDir = "uploads/template";
    }

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (
    req.originalUrl.includes("/api/investors") ||
    req.originalUrl.includes("/api/cofounders")
  ) {
    // For investor and co-founder routes, only allow images
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Not an image! Please upload an image file."), false);
    }
  } else {
    // For other routes, allow all file types
    cb(null, true);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Serve static files from the uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
const coFounderRoutes = require("./routes/coFounderRoutes");

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/document", documentRoutes);
app.use("/api/matrix", matrixRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/job-requests", jobRequestRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/startup", startupRoutes); 
app.use("/api/unicorn", pathToUnicorn);
app.use("/api/resource", resourceRoutes(upload));
app.use("/api/unicorn", pathToUnicorn);
app.use("/api/messages", messageRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/investors", investorRoutes(upload));
app.use("/api/templates", templateRoute(upload));
app.use("/api/mentors", mentorRoutes(upload));
app.use("/api/categories", categoryRoutes(upload));
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

// HTTPS Setup (Production Only)
if (process.env.NODE_ENV === "production") {
  const SSL_KEY_PATH =
    "/etc/letsencrypt/live/app.incubationmasters.com/privkey.pem";
  const SSL_CERT_PATH =
    "/etc/letsencrypt/live/app.incubationmasters.com/fullchain.pem";

  if (fs.existsSync(SSL_KEY_PATH) && fs.existsSync(SSL_CERT_PATH)) {
    const httpsOptions = {
      key: fs.readFileSync(SSL_KEY_PATH),
      cert: fs.readFileSync(SSL_CERT_PATH),
    };

    const PORT = process.env.PORT || 5000;
    const HOST = "0.0.0.0";

    https.createServer(httpsOptions, app).listen(PORT, HOST, () => {
      console.log(`Server is running securely on https://${HOST}:${PORT}`);
    });
  } else {
    console.error("SSL certificates not found. Please check your paths.");
    process.exit(1);
  }
} else {
  // Fallback to HTTP for Development
  const PORT = process.env.PORT || 5000;
  const HOST = "0.0.0.0";

  app.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
  });
}
