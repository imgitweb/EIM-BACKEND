const mongoose = require("mongoose");

const MVPSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  services: { type: String, required: true },
  website: { type: String },
  contactPerson: { type: String },
  contactNo: { type: String },
  location: { type: String },
  logo: { type: String,
    default: "https://images.unsplash.com/photo-1761735679475-9321c24f2794?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1035"
   },
  category: {
    type: String,
    enum: [
    "WebDev",
    "AI",
    "FullStack",
    "Startup",
    "Design",
    "NoCode",
    "Blockchain",
    "MarketingTech",
    "ProductStudio",
    "Ecom",
    "Consulting"
  ],
    required: true
  },
  discription: { type: String  },
  

}, { timestamps: true });



module.exports = mongoose.model("MVPTeam", MVPSchema);