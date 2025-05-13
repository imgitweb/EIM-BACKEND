const Admin = require("../models/adminModel");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const hashPassword = (password) => {
  if (typeof password !== "string") {
    throw new Error("Password must be a string");
  }
  return crypto.createHash("md5").update(password).digest("hex");
};

class AdminController {
  async login(req, res) {
    try {
      const { email_id, password } = req.body;

      // Input validation
      if (!email_id || typeof email_id !== "string") {
        return res.status(400).json({
          status: "error",
          message: "Valid email is required",
        });
      }

      if (!password || typeof password !== "string") {
        return res.status(400).json({
          status: "error",
          message: "Valid password is required",
        });
      }

      const hashedPassword = hashPassword(password);

      const admin = await Admin.findOne({
        email_id: email_id.toLowerCase(),
      }).select("+password");

      if (!admin || admin.password !== hashedPassword) {
        return res.status(401).json({
          status: "error",
          message: "Invalid email or password",
        });
      }

      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined");
      }

      const token = jwt.sign(
        {
          admin_id: admin._id,
          email_id: admin.email_id,
          role: admin.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.status(200).json({
        status: "success",
        message: "Login successful",
        data: {
          admin_id: admin._id,
          email_id: admin.email_id,
          role: admin.role,
          token,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        status: "error",
        message: error.message || "Internal server error",
      });
    }
  }

  async create(req, res) {
    try {
      const { email_id, password, role } = req.body;

      // Input validation
      if (!email_id || typeof email_id !== "string") {
        return res.status(400).json({
          status: "error",
          message: "Valid email is required",
        });
      }

      if (!password || typeof password !== "string") {
        return res.status(400).json({
          status: "error",
          message: "Valid password is required",
        });
      }

      const hashedPassword = hashPassword(password);

      const admin = new Admin({
        email_id: email_id.toLowerCase(),
        password: hashedPassword,
        role: role || "admin",
      });

      await admin.save();

      res.status(201).json({
        status: "success",
        message: "Admin created successfully",
        data: {
          admin_id: admin._id,
          email_id: admin.email_id,
          role: admin.role,
        },
      });
    } catch (error) {
      console.error("Create admin error:", error);
      res.status(500).json({
        status: "error",
        message:
          error.code === 11000
            ? "Email already exists"
            : error.message || "Internal server error",
      });
    }
  }
}

module.exports = new AdminController();
