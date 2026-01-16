// ─────────────────────────────────────────────────────────────
// ✅ Import Core Modules & Middleware
// ─────────────────────────────────────────────────────────────
const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const fs = require("fs");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");
require("dotenv").config();

// ─────────────────────────────────────────────────────────────
// ✅ Import Custom Modules & Routes
// ─────────────────────────────────────────────────────────────
const connectDB = require("./config/db");
const seedMentorData = require("./seeding/mentorSeed");
const seedInvestorData = require("./seeding/seedInvestorData");
const seedCategoryData = require("./seeding/seedCategoryData");
const seedPartnerData = require("./seeding/partnerSeed");
const SeedMVPTeam = require("./seeding/MVPSeed");
const { seedDeliverables } = require("./seeding/deliverablesSeeder");
const eilaRoutes = require("./routes/EILACofounderRoutes");

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
  updateCompanyDetailsRoutes: require("./routes/UpdateCompanyDetailsRoutes"),
  whatsappRoutes: require("./routes/twilio/notifyRoutes"),
};

const { ActivityRoute } = require("./routes/Activity/activityRoute");
const { paymentRouters } = require("./routes/PaymentRoutes/routes");
const { DeliverableRoutes } = require("./routes/DeliverableRoutes/deliverable");
const { milestoneRoutes } = require("./routes/MilistonePath/milestoneRoutes");
const offerings = require("./routes/OfferingRoutes/OfferingRoute");
const marketsizecalculator = require("./routes/MarketSizeRoutes/MarketSizeCalculatorRoute");
const HackRegistration = require("./routes/HackRoute/HackRoutes");
const marketing = require("./routes/marketingRoutes");
const leadRoutes = require("./routes/LeadRoute.js");
const pitchDeckroutes = require("./routes/pitchDeckroutes.js");
const businessModelRoutes = require("./routes/businessModelRoutes.js");
const {
  DocumentVaultRoutes,
} = require("./routes/DocumentVaultRoutes/routes.js");

// ─────────────────────────────────────────────────────────────
// ✅ App Initialization & DB
// ─────────────────────────────────────────────────────────────
const app = express();
connectDB();
seedMentorData();
seedInvestorData();
seedCategoryData();
seedPartnerData();
SeedMVPTeam();
seedDeliverables();

// ─────────────────────────────────────────────────────────────
// ✅ Security & Session (Fixed for Production)
// ─────────────────────────────────────────────────────────────
app.set("trust proxy", 1);

const isProduction = process.env.NODE_ENV === "production";

app.use(
  session({
    name: "sid",
    secret: process.env.SESSION_SECRET || "fallback_secret",
    resave: true,
    saveUninitialized: true,
    rolling: true,
    proxy: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      ttl: 24 * 60 * 60,
    }),
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
    },
  })
);

// Session Debugger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - Session ID: ${req.sessionID}`);
  next();
});

// ─────────────────────────────────────────────────────────────
// ✅ CORS Setup
// ─────────────────────────────────────────────────────────────
const allowedOrigins = isProduction
  ? [
      "https://app.incubationmasters.com",
      "https://admin.incubationmasters.com",
      "https://www.incubationmasters.com",
      "https://incubationmasters.com",
      "https://hackmake.in",
      "https://www.hackmake.in",
    ]
  : [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:5000",
      "http://localhost:5173",
    ];

const corsOptions = {
  origin: function (origin, callback) {
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      origin.startsWith("http://localhost")
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-csrf-token"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// ─────────────────────────────────────────────────────────────
// ✅ Global Middleware & Static Files
// ─────────────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(
  "/startupidea/uploads",
  express.static(path.join(__dirname, "startupidea/uploads"))
);
app.use(
  "/startupidea/photos",
  express.static(path.join(__dirname, "startupidea/photos"))
);

// ─────────────────────────────────────────────────────────────
// ✅ Multer Storage Config
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
    else if (url.includes("/api/hackathon")) folder = "startupidea/uploads";
    else if (url.includes("/api/document_vault"))
      folder = `uploads/document_vault/${req.query.folder_name || ""}`;

    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// ─────────────────────────────────────────────────────────────
// ✅ Routes Mapping
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
app.use("/api/course", routes.course);
app.use("/api/post-cofounder", routes.postCoFounder);
app.use("/api/startup-hire", routes.startupHireTeamRoutes);
app.use(
  "/api/PostCoFounderRequirement",
  routes.PostCoFounderRequirementsRoutes
);
app.use("/api/update-company-details", routes.updateCompanyDetailsRoutes);
app.use("/", routes.companyRegistrationRoutes);
app.use("/api/partners", require("./routes/partnerRoutes"));
app.use("/api/market", routes.MarketSize);
app.use("/api/mvp-team", require("./routes/MVP/MVPTeamRoutes"));
app.use("/api/mvp-feature", require("./routes/MVP/featureRoutes"));
app.use("/api/valuation", routes.valuationRoutes);
app.use("/api/product", routes.salesProduct);
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
app.use("/api/ask-eila", eilaRoutes);
app.use("/api/contact", require("./routes/contactRoutes"));
app.use("/api/marketing", marketing);
app.use("/api/leads", leadRoutes);
app.use("/api/business-model", businessModelRoutes);
app.use("/api/whatsapp", routes.whatsappRoutes);
app.use("/api/document_vault", DocumentVaultRoutes(upload));
app.use("/api/pitchdeck", pitchDeckroutes);

app.get("/", (req, res) => {
  res.json({ message: "Incubation Masters API Online", status: "OK" });
});

// ─────────────────────────────────────────────────────────────
// ✅ Error Handlers
// ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal Server Error" });
});

// ─────────────────────────────────────────────────────────────
// ✅ Server Start
// ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `🌐 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`
  );
});
