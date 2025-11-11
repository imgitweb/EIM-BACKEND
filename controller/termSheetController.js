const TermSheet = require("../models/TermSheet");
const User = require("../models/signup/StartupModel");
const PDFDocument = require("pdfkit");
const { generateTermSheetPDF } = require("../utils/pdfGenerator");

// ---------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------
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

const castToString = (value) => (value == null ? "" : String(value).trim());

// ---------------------------------------------------------------------
// CREATE TERM SHEET
// ---------------------------------------------------------------------
const createTermSheet = async (req, res) => {
  try {
    const data = req.body;

    // ---------- Clean & Cast Payload ----------
    const cleanedData = {
      user: req.user.id,

      // === Parties ===
      investors: Array.isArray(data.investors)
        ? data.investors
            .map((i) => ({ name: castToString(i?.name) }))
            .filter((i) => i.name)
        : [],

      issuer: {
        name: castToString(data.issuer?.name),
        address: castToString(data.issuer?.address),
      },

      founders: Array.isArray(data.founders)
        ? data.founders
            .map((f) => ({ name: castToString(f?.name) }))
            .filter((f) => f.name)
        : [],

      businessDescription: castToString(data.businessDescription),

      // === Valuation & Funding ===
      preMoneyValuation: castToNumber(data.preMoneyValuation, "preMoneyValuation"),
      mandatoryInvestment: castToNumber(data.mandatoryInvestment, "mandatoryInvestment"),
      mandatoryEquity: castToNumber(data.mandatoryEquity, "mandatoryEquity"),
      optionalInvestment: castToNumber(data.optionalInvestment, "optionalInvestment"),
      totalShares: castToNumber(data.totalShares, "totalShares"),

      // === Instrument ===
      instrumentType: castToString(data.instrumentType) || "Equity shares",

      // === Closing & Lock-in ===
      expectedClosingDate: castToDate(data.expectedClosingDate),
      founderLockIn: Boolean(data.founderLockIn),
      lockInDetails: castToString(data.lockInDetails),

      // === NEW BROAD CONDITION FIELDS ===
      investmentAmount: castToNumber(data.investmentAmount, "investmentAmount"),
      instrumentPrice: castToNumber(data.instrumentPrice, "instrumentPrice"),
      liquidationPreference: castToString(data.liquidationPreference),
      votingRights: castToString(data.votingRights),
      rightToMaintainCapital: castToString(data.rightToMaintainCapital),
      transferRights: castToString(data.transferRights),
      exitDate: castToDate(data.exitDate),
      tagAlongRights: castToString(data.tagAlongRights),
      antiDilutionProtection: castToString(data.antiDilutionProtection),
      protectiveProvisions: castToString(data.protectiveProvisions),
      companyDebts: castToString(data.companyDebts),
      informationRights: castToString(data.informationRights),
      dragAlongRights: castToString(data.dragAlongRights),
      representationsWarranties: castToString(data.representationsWarranties),
      governingLaw: castToString(data.governingLaw) || "Indian Law",
      disputeResolution: castToString(data.disputeResolution),
      existingInvestorRights: castToString(data.existingInvestorRights),
    };

    // ---------- Required-field validation ----------
    const requiredFields = [
      "issuer.name",
      "preMoneyValuation",
      "mandatoryInvestment",
    ];
    for (const field of requiredFields) {
      const keys = field.split(".");
      let value = cleanedData;
      for (const key of keys) value = value?.[key];
      if (!value) {
        return res
          .status(400)
          .json({ message: `Missing required field: ${field}` });
      }
    }

    // ---------- Save ----------
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

// ---------------------------------------------------------------------
// GET MY TERM SHEETS
// ---------------------------------------------------------------------
const getMyTermSheets = async (req, res) => {
  try {
    const termSheets = await TermSheet.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(termSheets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------------------------------------------------------------
// GET TERM SHEET BY ID
// ---------------------------------------------------------------------
const getTermSheetById = async (req, res) => {
  try {
    const termSheet = await TermSheet.findById(req.params.id);

    if (!termSheet) {
      return res.status(404).json({ message: "Term sheet not found" });
    }

    if (termSheet.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.json(termSheet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------------------------------------------------------------
// DOWNLOAD TERM SHEET PDF
// ---------------------------------------------------------------------
const downloadTermSheetPdf = async (req, res) => {
  try {
    const termSheet = await TermSheet.findById(req.params.id);

    if (!termSheet) {
      return res.status(404).json({ message: "Term sheet not found" });
    }

    if (termSheet.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const filename = `TermSheet_${termSheet.issuer.name
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_]/g, "")}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );

    const doc = new PDFDocument({ margin: 50, size: "A4" });
    doc.pipe(res);

    // Pass the **full termSheet object** – the PDF generator will pick the new fields
    generateTermSheetPDF(doc, termSheet);

    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ message: "Error generating PDF" });
  }
};

// ---------------------------------------------------------------------
module.exports = {
  createTermSheet,
  getMyTermSheets,
  getTermSheetById,
  downloadTermSheetPdf,
};