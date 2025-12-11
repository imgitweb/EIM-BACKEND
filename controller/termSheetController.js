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

const castToBoolean = (value) => Boolean(value);

// Instrument-specific field handler
const getInstrumentSpecificFields = (instrumentType, data) => {
  const fields = {};

  switch (instrumentType) {
    case "Equity Shares":
      fields.liquidationPreference = castToString(data.liquidationPreference);
      fields.antiDilution = castToString(data.antiDilution);
      fields.proRataRights = castToString(data.proRataRights);
      fields.dragAlongThreshold = castToString(data.dragAlongThreshold);
      fields.tagAlongRights = castToString(data.tagAlongRights);
      fields.votingRights = castToString(data.votingRights);
      fields.inspectionRights = castToString(data.inspectionRights);
      break;

    case "CCPS":
      fields.ccpsSeries = castToString(data.ccpsSeries);
      fields.dividendRate = castToNumber(data.dividendRate, "dividendRate");
      fields.liquidationPreference = castToString(data.liquidationPreference);
      fields.conversionRatio = castToString(data.conversionRatio);
      fields.conversionTrigger = castToString(data.conversionTrigger);
      fields.boardRepresentation = castToString(data.boardRepresentation);
      fields.preemptiveRights = castToString(data.preemptiveRights);
      fields.informationRights = castToString(data.informationRights);
      break;

    case "CCD":
      fields.interestRate = castToNumber(data.interestRate, "interestRate");
      fields.tenure = castToString(data.tenure);
      fields.conversionMethod = castToString(data.conversionMethod);
      fields.securityType = castToString(data.securityType);
      fields.conversionTrigger = castToString(data.conversionTrigger);
      fields.interestPaymentType = castToString(data.interestPaymentType);
      fields.reportingFrequency = castToString(data.reportingFrequency);
      break;

    case "SAFE-India":
      fields.safeType = castToString(data.safeType);
      fields.discountRate = castToNumber(data.discountRate, "discountRate");
      fields.valuationCap = castToNumber(data.valuationCap, "valuationCap");
      fields.mfnClause = castToString(data.mfnClause);
      fields.longStopDate = castToString(data.longStopDate);
      fields.votingRights = castToString(data.votingRights);
      fields.informationRights = castToString(data.informationRights);
      break;

    case "Convertible Notes":
      fields.conversionDiscount = castToNumber(
        data.conversionDiscount,
        "conversionDiscount"
      );
      fields.valuationCap = castToNumber(data.valuationCap, "valuationCap");
      fields.maturityPeriod = castToString(data.maturityPeriod);
      fields.conversionEvent = castToString(data.conversionEvent);
      fields.repaymentOption = castToString(data.repaymentOption);
      fields.interestPaymentType = castToString(data.interestPaymentType);
      fields.reportingRights = castToString(data.reportingRights);
      fields.interestRate = castToNumber(data.interestRate, "interestRate");
      break;

    default:
      break;
  }

  return fields;
};

// ---------------------------------------------------------------------
// CREATE TERM SHEET
// ---------------------------------------------------------------------
const createTermSheet = async (req, res) => {
  try {
    const data = req.body;

    // ---------- Clean & Cast Payload ----------
    const instrumentType = castToString(data.instrumentType) || "Equity Shares";
    const instrumentSpecificFields = getInstrumentSpecificFields(
      instrumentType,
      data
    );

    const cleanedData = {
      user: req.user.id,

      // === Basic Company Details ===
      companyName: castToString(data.companyName),
      cin: castToString(data.cin),
      registeredAddress: castToString(data.registeredAddress),
      contactPerson: castToString(data.contactPerson),

      // === Investor Details ===
      investorName: castToString(data.investorName),
      investorType: castToString(data.investorType) || "Angel",

      // === Investment Details ===
      instrumentType: instrumentType,
      roundType: castToString(data.roundType) || "Seed",
      investmentAmount: castToNumber(data.investmentAmount, "investmentAmount"),
      preMoneyValuation: castToNumber(
        data.preMoneyValuation,
        "preMoneyValuation"
      ),
      totalSharesPre: castToNumber(data.totalSharesPre, "totalSharesPre"),

      // === Derived Values ===
      postMoneyValuation: castToNumber(
        data.postMoneyValuation,
        "postMoneyValuation"
      ) || (castToNumber(data.investmentAmount, "investmentAmount") + castToNumber(data.preMoneyValuation, "preMoneyValuation")),
      equityDilution: castToNumber(data.equityDilution, "equityDilution"),
      pricePerShare: castToNumber(data.pricePerShare, "pricePerShare"),
      sharesToBeIssued: castToNumber(
        data.sharesToBeIssued,
        "sharesToBeIssued"
      ),

      // === Investment Terms ===
      conditionsPrecedent: castToString(data.conditionsPrecedent),
      conditionsSubsequent: castToString(data.conditionsSubsequent),
      closingDate: castToDate(data.closingDate),

      // === Instrument-Specific Fields ===
      instrumentSpecificTerms: instrumentSpecificFields,

      // === Investor Rights - General ===
      boardSeat: castToBoolean(data.boardSeat),
      boardSeatCount: castToNumber(data.boardSeatCount, "boardSeatCount"),
      boardObserver: castToBoolean(data.boardObserver),
      protectiveProvisions: castToString(data.protectiveProvisions),
      informationRights: castToString(data.informationRights),

      // === Company Obligations ===
      esopPoolSize: castToNumber(data.esopPoolSize, "esopPoolSize"),
      complianceRequirements: castToString(data.complianceRequirements),
      managementCovenants: castToString(data.managementCovenants),
      reportingObligations: castToString(data.reportingObligations),
      debtRestrictions: castToString(data.debtRestrictions),
      founderCommitment: castToBoolean(data.founderCommitment),
      vestingSchedule: castToString(data.vestingSchedule),

      // === Representations & Warranties ===
      companiesActCompliance: castToBoolean(data.companiesActCompliance),
      femaCompliance: castToBoolean(data.femaCompliance),
      noLitigation: castToBoolean(data.noLitigation),
      noOtherTermsheet: castToBoolean(data.noOtherTermsheet),
      ipOwnership: castToBoolean(data.ipOwnership),
      founderDocs: castToBoolean(data.founderDocs),
      taxCompliance: castToBoolean(data.taxCompliance),

      // === Legacy/General Fields ===
      investors: [{ name: castToString(data.investorName) }],
      issuer: {
        name: castToString(data.companyName),
        address: castToString(data.registeredAddress),
      },
      businessDescription: castToString(data.businessDescription),
      governingLaw: castToString(data.governingLaw) || "Indian Law",
      disputeResolution: castToString(data.disputeResolution),
    };

    // ---------- Required-field validation ----------
    const requiredFields = [
      "companyName",
      "investorName",
      "investmentAmount",
      "preMoneyValuation",
      "totalSharesPre",
      "closingDate",
    ];

    for (const field of requiredFields) {
      const value = cleanedData[field];
      if (!value && value !== 0 && value !== false) {
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
    const termSheets = await TermSheet.find({ user: req.user.id })
      .select(
        "companyName instrumentType investorName investmentAmount preMoneyValuation closingDate createdAt"
      )
      .sort({ createdAt: -1 });

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
// UPDATE TERM SHEET
// ---------------------------------------------------------------------
const updateTermSheet = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const termSheet = await TermSheet.findById(id);

    if (!termSheet) {
      return res.status(404).json({ message: "Term sheet not found" });
    }

    if (termSheet.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const instrumentType = castToString(data.instrumentType) || termSheet.instrumentType;
    const instrumentSpecificFields = getInstrumentSpecificFields(
      instrumentType,
      data
    );

    // Update fields
    termSheet.companyName = castToString(data.companyName) || termSheet.companyName;
    termSheet.cin = castToString(data.cin) || termSheet.cin;
    termSheet.registeredAddress = castToString(data.registeredAddress) || termSheet.registeredAddress;
    termSheet.contactPerson = castToString(data.contactPerson) || termSheet.contactPerson;
    termSheet.investorName = castToString(data.investorName) || termSheet.investorName;
    termSheet.investorType = castToString(data.investorType) || termSheet.investorType;
    termSheet.instrumentType = instrumentType;
    termSheet.roundType = castToString(data.roundType) || termSheet.roundType;
    termSheet.investmentAmount = castToNumber(data.investmentAmount, "investmentAmount") || termSheet.investmentAmount;
    termSheet.preMoneyValuation = castToNumber(data.preMoneyValuation, "preMoneyValuation") || termSheet.preMoneyValuation;
    termSheet.totalSharesPre = castToNumber(data.totalSharesPre, "totalSharesPre") || termSheet.totalSharesPre;
    termSheet.closingDate = castToDate(data.closingDate) || termSheet.closingDate;
    termSheet.instrumentSpecificTerms = instrumentSpecificFields;
    termSheet.boardSeat = castToBoolean(data.boardSeat);
    termSheet.boardSeatCount = castToNumber(data.boardSeatCount, "boardSeatCount");
    termSheet.boardObserver = castToBoolean(data.boardObserver);
    termSheet.protectiveProvisions = castToString(data.protectiveProvisions) || termSheet.protectiveProvisions;
    termSheet.conditionsPrecedent = castToString(data.conditionsPrecedent) || termSheet.conditionsPrecedent;
    termSheet.conditionsSubsequent = castToString(data.conditionsSubsequent) || termSheet.conditionsSubsequent;
    termSheet.esopPoolSize = castToNumber(data.esopPoolSize, "esopPoolSize");
    termSheet.complianceRequirements = castToString(data.complianceRequirements) || termSheet.complianceRequirements;
    termSheet.managementCovenants = castToString(data.managementCovenants) || termSheet.managementCovenants;
    termSheet.reportingObligations = castToString(data.reportingObligations) || termSheet.reportingObligations;
    termSheet.debtRestrictions = castToString(data.debtRestrictions) || termSheet.debtRestrictions;
    termSheet.founderCommitment = castToBoolean(data.founderCommitment);
    termSheet.vestingSchedule = castToString(data.vestingSchedule) || termSheet.vestingSchedule;
    termSheet.companiesActCompliance = castToBoolean(data.companiesActCompliance);
    termSheet.femaCompliance = castToBoolean(data.femaCompliance);
    termSheet.noLitigation = castToBoolean(data.noLitigation);
    termSheet.noOtherTermsheet = castToBoolean(data.noOtherTermsheet);
    termSheet.ipOwnership = castToBoolean(data.ipOwnership);
    termSheet.founderDocs = castToBoolean(data.founderDocs);
    termSheet.taxCompliance = castToBoolean(data.taxCompliance);

    const updatedTermSheet = await termSheet.save();
    res.json(updatedTermSheet);
  } catch (error) {
    console.error("Update TermSheet Error:", error.message);
    res.status(400).json({
      message: "Error updating term sheet",
      error: error.message,
    });
  }
};

// ---------------------------------------------------------------------
// DELETE TERM SHEET
// ---------------------------------------------------------------------
const deleteTermSheet = async (req, res) => {
  try {
    const { id } = req.params;

    const termSheet = await TermSheet.findById(id);

    if (!termSheet) {
      return res.status(404).json({ message: "Term sheet not found" });
    }

    if (termSheet.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await TermSheet.findByIdAndDelete(id);
    res.json({ message: "Term sheet deleted successfully" });
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

    const filename = `TermSheet_${termSheet.companyName
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_]/g, "")}_${new Date().getTime()}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );

    const doc = new PDFDocument({ margin: 50, size: "A4" });
    doc.pipe(res);

    // Pass the full termSheet object with instrument-specific fields
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
  updateTermSheet,
  deleteTermSheet,
  downloadTermSheetPdf,
};