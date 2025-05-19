const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const startupSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      match: [
        /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/,
        "Password must include uppercase, number, and special character",
      ],
      select: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    stripeCustomerId: {
      type: String,
      unique: true,
      sparse: true,
    },
    selectedPlan: {
      type: String,
      default: "alpha",
    },
    startupName: {
      type: String,
      required: [true, "Startup name is required"],
      trim: true,
      unique: true,
    },
    contactPersonName: {
      type: String,
      required: [true, "Contact person name is required"],
      trim: true,
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
    },
    state: {
      type: String,
      required: [true, "State/Province is required"],
      trim: true,
    },
    industry: {
      type: String,
      required: [true, "Industry is required"],
      trim: true,
    },
    website: {
      type: String,
      trim: true,
      match: [
        /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
        "Please provide a valid URL",
      ],
    },
    startupStage: {
      type: String,
      required: [true, "Startup stage is required"],
      enum: [
        "Idea Stage",
        "Prototype",
        "Early Traction",
        "Scaling",
        "Growth",
        "Mature",
      ],
    },
    contactNumber: {
      type: String,
      required: [true, "Contact number is required"],
      trim: true,
      match: [/^\+?[0-9]{10,15}$/, "Please provide a valid contact number"],
    },
    elevatorPitch: {
      type: String,
      required: [true, "Elevator pitch is required"],
      trim: true,
      maxlength: [200, "Elevator pitch must be 200 characters or less"],
    },
    logoUrl: {
      type: String,
      required: [true, "Logo URL is required"],
    },
  },
  { timestamps: true }
);

// Pre-save hook to hash password
startupSchema.pre("save", async function (next) {
  if (this.isModified("password") && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Method to compare passwords
startupSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("StartupModel", startupSchema);
