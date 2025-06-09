const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const https = require("https");
const fs = require("fs");
const connectDB = require("./config/db");
require("dotenv").config();
const session = require("express-session");
const seedMentorData = require("./seeding/mentorSeed");
const seedInvestorData = require("./seeding/seedCategoryData");
const seedCategoryData = require("./seeding/seedCategoryData");

const MongoStore = require("connect-mongo");
const helmet = require("helmet");

const app = express();
app.use(helmet());

// Connect to database FIRST
connectDB();

// Seed mentor data if needed
seedMentorData()
seedInvestorData();
// Seed category data if needed
seedCategoryData();

// CORS configuration - MUST come before session
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? [
        "https://app.incubationmasters.com",
        "https://incubationmasters.com",
        "http://localhost:3000",
        "http://localhost:3001",
        "https://admin.incubationmasters.com",
        "https://www.incubationmasters.com",
      ]
    : [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
      ];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-csrf-token"],
  credentials: true, // THIS IS CRITICAL
};

// Apply middlewares in correct order
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// SESSION MIDDLEWARE - MOVE THIS BEFORE DEBUG MIDDLEWARE
app.use(
  session({
    name: "sessionId",
    secret: process.env.JWT_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
    }),
    cookie: {
      httpOnly: true,
      secure: false, // MUST be false for localhost
      sameSite: "lax", // Changed from "none" to "lax" for localhost
      maxAge: 1000 * 60 * 30, // 30 minutes (reduced from 1 day)
    },
  })
);

// DEBUG MIDDLEWARE - NOW SESSIONS WILL BE AVAILABLE
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - Session ID: ${req.sessionID}`);
  console.log("Session Data:", req.session);
  console.log("Cookies:", req.headers.cookie);
  next();
});

// Routes
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
const shaktiSangamRoutes = require("./routes/shaktiSangamRoutes");
const userLogsRoutes = require("./routes/userLogs");
const apiRoutes = require("./routes/api");
const coFounderRoutes = require("./routes/coFounderRoutes");

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const url = req.originalUrl;
    let folder = "uploads/template";

    if (url.includes("/api/investors")) folder = "uploads/investors";
    else if (url.includes("/api/mentors")) folder = "uploads/mentors";
    else if (url.includes("/api/categories")) folder = "uploads/categories";
    else if (url.includes("/api/templates")) folder = "uploads/templates";

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    cb(null, folder);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (
    req.originalUrl.includes("/api/investors") ||
    req.originalUrl.includes("/api/cofounders")
  ) {
    return file.mimetype.startsWith("image/")
      ? cb(null, true)
      : cb(new Error("Not an image! Please upload an image file."), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Health check route
app.get("/", (req, res) => {
  res.json({
    message: "Incubation Masters API",
    status: "OK",
    timestamp: new Date().toISOString(),
    endpoints: ["/api/v1/startups", "/api/v1/csrf-token"],
  });
});

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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
app.use("/api/messages", messageRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/investors", investorRoutes(upload));
app.use("/api/templates", templateRoute(upload));
app.use("/api/mentors", mentorRoutes(upload));
app.use("/api/categories", categoryRoutes(upload));
app.use("/api/shaktiSangam", shaktiSangamRoutes);
app.use("/api/logs", userLogsRoutes);
app.use("/api/v1", apiRoutes);
app.use("/api/cofounders", coFounderRoutes(upload));

// Multer error handler
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `Multer Error: ${err.message}` });
  } else if (err.message === "Not an image! Please upload an image file.") {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

// General error handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal Server Error" });
});

// HTTPS server setup
const PORT = process.env.PORT || 5000;
const HOST = "0.0.0.0";

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
    https.createServer(httpsOptions, app).listen(PORT, HOST, () => {
      console.log(`Secure server running at https://${HOST}:${PORT}`);
    });
  } else {
    console.warn("SSL certificates missing. Falling back to HTTP.");
    app.listen(PORT, HOST, () => {
      console.log(`Server running at http://${HOST}:${PORT}`);
    });
  }
} else {
  app.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}`);
  });
}

