const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
  {
    member_name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    mobile: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^\d{10}$/.test(v); // Example: 10-digit mobile number
        },
        message: (props) => `${props.value} is not a valid mobile number!`,
      },
    },
    designation: { type: String, required: true },
    job_type: { type: String, required: true },
    joining_date: { type: Date, required: true },
    salary: { type: Number, required: true, min: 0 },
    startup_id: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Team", teamSchema);
