const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const teamRoutes = require("./routes/teamRoutes");
const companyRoutes = require("./routes/companyRoutes");
const documentRoutes = require("./routes/documentRoutes");
const matrixRoutes = require("./routes/matrixRoutes");
const leadRoutes = require("./routes/leadRoutes");
const jobRequestRoutes = require("./routes/jobRequestRoutes");
const todoRoutes = require("./routes/todoRoutes");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json()); // Replacing body-parser with Express's built-in middleware
app.use(express.urlencoded({ extended: true }));

// Configure CORS based on environment
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? ["http://64.227.177.30"] // Production origin
    : ["http://localhost:3000", "http://localhost:3001"]; // Development origins

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

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/document", documentRoutes);
app.use("/api/matrix", matrixRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/job-requests", jobRequestRoutes);
app.use("/api/todos", todoRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Start Server
const PORT = process.env.PORT || 5000;
const HOST = "0.0.0.0"; // Bind to all network interfaces
app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});

