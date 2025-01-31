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
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure CORS based on environment
const allowedOrigins =
  process.env.NODE_ENV === "production"
<<<<<<< HEAD
    ? ["https://app.incubationmasters.com"] // Production origin
    : ["http://localhost:3000", "http://localhost:3001","http://localhost:5173"]; // Development origins
=======
    ? ["https://app.incubationmasters.com", "https://incubationmasters.com"] // Production origin
    : ["http://localhost:3000", "http://localhost:3001"]; // Development origins
>>>>>>> 0df95910b83543af54a3407d3b09a593cfed7b97

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

// Multer setup for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/template");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

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
app.use("/uploads", express.static("uploads"));
app.use("/api/resource", resourceRoutes(upload));
app.use("/api/unicorn", pathToUnicorn);
app.use("/api/messages", messageRoutes);
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
