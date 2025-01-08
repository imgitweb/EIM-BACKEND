const express = require("express");
const bodyParser = require("body-parser");
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
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Connect to Database
connectDB();

// Routes
app.use("/api/auth", authRoutes); // Ensure this works
app.use("/api/team", teamRoutes); // Ensure this works
app.use("/api/company", companyRoutes);
app.use("/api/document", documentRoutes);
app.use("/api/matrix", matrixRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/job-requests", jobRequestRoutes);
app.use("/api/todos", todoRoutes);
// Start Server
const PORT = process.env.PORT || 5000;
const HOST = "64.227.177.30";
app.listen(PORT, HOST, () => {
  console.log(`Server is running on port ${PORT}`);
});
