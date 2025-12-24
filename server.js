// ─────────────────────────────────────────────────────────────
// ✅ Import Core Modules & Middleware
// ─────────────────────────────────────────────────────────────
const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const https = require("https");
const fs = require("fs");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");
require("dotenv").config();

// ─────────────────────────────────────────────────────────────
// ✅ Import Custom Modules
// ─────────────────────────────────────────────────────────────
const connectDB = require("./config/db");
const seedMentorData = require("./seeding/mentorSeed");
const seedInvestorData = require("./seeding/seedInvestorData");
const seedCategoryData = require("./seeding/seedCategoryData");
const seedPartnerData = require("./seeding/partnerSeed");
const courseRoutes = require("./routes/CourseRoutes");
const SeedMVPTeam = require("./seeding/MVPSeed");
const { seedActivities } = require("./seeding/activitySeeder");
const eilaRoutes = require('./routes/EILACofounderRoutes');

// ─────────────────────────────────────────────────────────────
// ✅ Import Routes
// ─────────────────────────────────────────────────────────────
const routes = {
  auth: require("./routes/authRoutes"),
  team: require("./routes/teamRoutes"),
  company: require("./routes/companyRoutes"),
  document: require("./routes/documentRoutes"),
  matrix: require("./routes/matrixRoutes"),
  leads: require("./routes/leadRoutes"),
  jobRequests: require("./routes/jobRequestRoutes"),
  todos: require("./routes/todoRoutes"),
  startup: require("./routes/startupRoutes"),
  unicorn: require("./routes/pathToUnicorn"),
  resources: require("./routes/resourceRoutes"),
  messages: require("./routes/messageRoutes"),
  admin: require("./routes/adminRoutes"),
  investors: require("./routes/investorRoutes"),
  templates: require("./routes/templateRoute"),
  mentors: require("./routes/mentorRoutes"),
  categories: require("./routes/categoryRoutes"),
  shaktiSangam: require("./routes/shaktiSangamRoutes"),
  logs: require("./routes/userLogs"),
  api: require("./routes/api"),
  legal: require("./routes/openaiRoutes"),
  cofounders: require("./routes/coFounderRoutes"),
  course: require("./routes/CourseRoutes"),
  postCoFounder: require("./routes/postCoFounderRoutes"),
  startupHireTeamRoutes: require("./routes/startupHireTeamRoutes"),
  PostCoFounderRequirementsRoutes: require("./routes/PostCoFounderRequirementsRoutes"),
  companyRegistrationRoutes: require("./routes/companyRegistrationRoutes"),
  MarketSize: require("./routes/marketSize"),
  valuationRoutes: require("./routes/valuationRoutes"),
  salesProduct: require("./routes/sales/salesRoute"),
  termSheetRoutes: require("./routes/termSheetRoutes"),
  clientPersonaRoutes: require("./routes/sales/clientPersonas"),
  complianceRoutes: require("./routes/complianceRoutes"),
  feedbackRoutes: require("./routes/feedbackRoutes"),
  captableRoutes: require("./routes/captableRoutes"),
  schemeRoutes: require("./routes/schemeRoutes"),
};
const { ActivityRoute } = require("./routes/Activity/activityRoute");
const { seedDeliverables } = require("./seeding/deliverablesSeeder");
const { paymentRouters } = require("./routes/PaymentRoutes/routes");
const { DeliverableRoutes } = require("./routes/DeliverableRoutes/deliverable");
const { milestoneRoutes } = require("./routes/MilistonePath/milestoneRoutes");
const offerings = require("./routes/OfferingRoutes/OfferingRoute");
const marketsizecalculator = require("./routes/MarketSizeRoutes/MarketSizeCalculatorRoute");
const HackRegistration = require("./routes/HackRoute/HackRoutes");

// ─────────────────────────────────────────────────────────────
// ✅ App Initialization
// ─────────────────────────────────────────────────────────────

const app = express();
connectDB();
seedMentorData();
seedInvestorData();
seedCategoryData();
seedPartnerData();
SeedMVPTeam();
seedActivities();
seedDeliverables();
// ─────────────────────────────────────────────────────────────
// ✅ CORS Setup
// ─────────────────────────────────────────────────────────────
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? [
        "https://app.incubationmasters.com",
        "http://app.incubationmasters.com",
        "https://app.incubationmasters.com:5000",
        "http://app.incubationmasters.com:5000",
        "https://admin.incubationmasters.com",
        "http://admin.incubationmasters.com",
        "https://www.incubationmasters.com",
        "http://www.incubationmasters.com",
        "https://incubationmasters.com:5000",
        "http://incubationmasters.com:5000",
        "https://incubationmasters.com",
        "http://incubationmasters.com",
      ]
    : [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:5000",
        "http://localhost:5173",
      ];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(
      new Error("CORS policy does not allow access from this origin")
    );
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "x-csrf-token",
  ],
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// ─────────────────────────────────────────────────────────────
// ✅ Global Middleware
// ─────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// ─────────────────────────────────────────────────────────────
// ✅ Session Configuration
// ─────────────────────────────────────────────────────────────
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
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);

// ─────────────────────────────────────────────────────────────
// ✅ Request Logging
// ─────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - Session ID: ${req.sessionID}`);
  next();
});

// ─────────────────────────────────────────────────────────────
// ✅ Multer File Upload Configuration
// ─────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = "uploads/template";
    const url = req.originalUrl;

    if (url.includes("/api/investors")) folder = "uploads/investors";
    else if (url.includes("/api/mentors")) folder = "uploads/mentors";
    else if (url.includes("/api/categories")) folder = "uploads/categories";
    else if (url.includes("/api/templates")) folder = "uploads/templates";
    else if (url.includes("/deliverable/mark-as-completed"))
      folder = "uploads/deliverables";
    else if (url.includes("/api/startup")) folder = "uploads";

    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const isImageRoute =
    req.originalUrl.includes("/api/investors") ||
    req.originalUrl.includes("/api/cofounders");
  if (isImageRoute && !file.mimetype.startsWith("image/")) {
    return cb(new Error("Not an image! Please upload an image file."), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// ─────────────────────────────────────────────────────────────
// ✅ Base Route
// ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    message: "Incubation Masters API",
    status: "OK",
    timestamp: new Date().toISOString(),
    endpoints: ["/api/startup", "/api/auth", "/api/templates", "..."],
  });
});

// ─────────────────────────────────────────────────────────────
// ✅ Routes
// ─────────────────────────────────────────────────────────────
app.use("/api/auth", routes.auth);
app.use("/api/team", routes.team);
app.use("/api/company", routes.company);
app.use("/api/document", routes.document);
app.use("/api/matrix", routes.matrix);
app.use("/api/leads", routes.leads);
app.use("/api/job-requests", routes.jobRequests);
app.use("/api/todos", routes.todos);
app.use("/api/startup", routes.startup);
app.use("/api/unicorn", routes.unicorn);
app.use("/api/resource", routes.resources(upload));
app.use("/api/messages", routes.messages);
app.use("/api/admin", routes.admin);
app.use("/api/investors", routes.investors(upload));
app.use("/api/templates", routes.templates(upload));
app.use("/api/mentors", routes.mentors(upload));
app.use("/api/categories", routes.categories(upload));
app.use("/api/shaktiSangam", routes.shaktiSangam);
app.use("/api/logs", routes.logs);
app.use("/api", routes.api);
app.use("/api/legal", routes.legal);
app.use("/api/cofounders", routes.cofounders(upload));
app.use("/api/chatgpt", require("./routes/chatGptRoutes"));
app.use("/api/idea", require("./routes/chatGptRoutes"));
app.use("/api/uim-register", require("./routes/chatGptRoutes"));
app.use("/api", courseRoutes);
app.use("/api/post-cofounder", routes.postCoFounder);
app.use("/api/startup-hire", routes.startupHireTeamRoutes);
app.use(
  "/api/PostCoFounderRequirement",
  routes.PostCoFounderRequirementsRoutes
);
app.use("/", routes.companyRegistrationRoutes);
app.use("/api/partners", require("./routes/partnerRoutes"));
app.use("/api/market", routes.MarketSize);
app.use("/api/mvp-team", require("./routes/MVP/MVPTeamRoutes"));
app.use("/api/mvp-feature", require("./routes/MVP/featureRoutes"));
app.use("/api/valuation", routes.valuationRoutes);
app.use("/api/product", routes.salesProduct);
app.use("/api/market", routes.MarketSize);
app.use("/api/termsheets", routes.termSheetRoutes);
app.use("/api/client-personas", routes.clientPersonaRoutes);
app.use("/api/compliances", routes.complianceRoutes);
app.use("/api/activity", ActivityRoute);
app.use("/api/payment", paymentRouters);
app.use("/api/deliverable", DeliverableRoutes(upload));
app.use("/api/feedback", routes.feedbackRoutes);
app.use("/api/milestones", milestoneRoutes);
app.use("/api/captable", routes.captableRoutes);
app.use("/api/schemes", routes.schemeRoutes);
app.use("/api/offering", offerings);
app.use("/api/market-calculation", marketsizecalculator);
app.use("/api/hackathon", HackRegistration);
app.use("/api/ask-eila", eilaRoutes)
// ─────────────────────────────────────────────────────────────
// ✅ Error Handlers
// ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `Multer Error: ${err.message}` });
  } else if (err.message === "Not an image! Please upload an image file.") {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal Server Error" });
});

// ─────────────────────────────────────────────────────────────
// ✅ Server Start (HTTPS in production)
// ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const HOST = "0.0.0.0";

if (process.env.NODE_ENV === "production") {
  app.listen(PORT, HOST, () => {
    console.log(`🌐 HTTP Server running at http://${HOST}:${PORT}`);
  });
} else {
  app.listen(PORT, HOST, () => {
    console.log(`🌐 Dev server running at http://${HOST}:${PORT}`);
  });
}
