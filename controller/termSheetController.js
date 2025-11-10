const TermSheet = require("../models/TermSheet");
const User = require("../models/signup/StartupModel");

const PDFDocument = require("pdfkit");
const { generateTermSheetPDF } = require("../utils/pdfGenerator"); 


const createTermSheet = async (req, res) => {
  try {
    const data = req.body;

    // 1. Type Casting Helper
    const castToNumber = (value, fieldName) => {
      if (value === undefined || value === null || value === "") return undefined;
      const num = Number(value);
      if (isNaN(num)) throw new Error(`Invalid number for ${fieldName}: ${value}`);
      return num;
    };

    const castToDate = (value) => {
      if (!value) return undefined;
      const date = new Date(value);
      if (isNaN(date.getTime())) throw new Error(`Invalid date: ${value}`);
      return date;
    };

    // 2. Clean & Cast Payload
    const cleanedData = {
      user: req.user.id,

      investors: Array.isArray(data.investors)
        ? data.investors.map(i => ({ name: String(i.name || "").trim() })).filter(i => i.name)
        : [],

      issuer: {
        name: String(data.issuer?.name || "").trim(),
        address: String(data.issuer?.address || "").trim(),
      },

      founders: Array.isArray(data.founders)
        ? data.founders.map(f => ({ name: String(f.name || "").trim() })).filter(f => f.name)
        : [],

      businessDescription: String(data.businessDescription || "").trim(),

      preMoneyValuation: castToNumber(data.preMoneyValuation, "preMoneyValuation"),
      mandatoryInvestment: castToNumber(data.mandatoryInvestment, "mandatoryInvestment"),
      mandatoryEquity: castToNumber(data.mandatoryEquity, "mandatoryEquity"),
      optionalInvestment: castToNumber(data.optionalInvestment, "optionalInvestment"),
      totalShares: castToNumber(data.totalShares, "totalShares"),

      instrumentType: String(data.instrumentType || "").trim(),
      expectedClosingDate: castToDate(data.expectedClosingDate),
      founderLockIn: Boolean(data.founderLockIn),
      lockInDetails: String(data.lockInDetails || "").trim(),
    };

    // 3. Optional: Add validation (e.g., mandatory fields)
    const requiredFields = ["issuer.name", "preMoneyValuation", "mandatoryInvestment"];
    for (const field of requiredFields) {
      const keys = field.split(".");
      let value = cleanedData;
      for (const key of keys) value = value[key];
      if (!value) {
        return res.status(400).json({ message: `Missing required field: ${field}` });
      }
    }

    // 4. Save
    const termSheet = new TermSheet(cleanedData);
    const createdTermSheet = await termSheet.save();

    res.status(201).json(createdTermSheet);
  } catch (error) {
    console.error("Create TermSheet Error:", error.message);
    res.status(400).json({
      message: "Error creating term sheet",
      error: error.message,
    });
  }
};


const getMyTermSheets = async (req, res) => {
  const termSheets = await TermSheet.find({ user: req.user.id });
  res.json(termSheets);
};


const getTermSheetById = async (req, res) => {
  const termSheet = await TermSheet.findById(req.params.id);

  if (termSheet && termSheet.user.toString() === req.user.id.toString()) {
    res.json(termSheet);
  } else {
    res.status(404).json({ message: "Term sheet not found" });
  }
};

const downloadTermSheetPdf = async (req, res) => {
  try {
    const termSheet = await TermSheet.findById(req.params.id);

    if (!termSheet || termSheet.user.toString() !== req.user.id.toString()) {
      return res.status(404).json({ message: "Term sheet not found" });
    }
    const filename = `TermSheet_${termSheet.issuer.name.replace(
      /\s/g,
      "_"
    )}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    const doc = new PDFDocument({ margin: 50, size: "A4" });

    doc.pipe(res);

    generateTermSheetPDF(doc, termSheet);

    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ message: "Error generating PDF" });
  }
};

module.exports = {
  createTermSheet,
  getMyTermSheets,
  getTermSheetById,
  downloadTermSheetPdf,
};