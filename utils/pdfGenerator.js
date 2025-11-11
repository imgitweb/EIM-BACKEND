// utils/pdfGenerator.js
const PDFDocument = require("pdfkit");

// ─────────────────────────────────────────────────────────────────────────────
//  ULTRA-SAFE HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const safe = (v) => (v != null && v !== "" ? String(v).trim() : "");
const toNum = (v) => {
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
};
const formatINR = (v) => {
  const n = toNum(v);
  if (n <= 0) return "";
  return `Rs.${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
};
const formatDate = (d) => {
  if (!d) return "";
  const date = new Date(d);
  return isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
};

// ─────────────────────────────────────────────────────────────────────────────
//  TABLE CELL RENDERER
// ─────────────────────────────────────────────────────────────────────────────
function drawTableCell(doc, text, x, y, width, height, isBold = false) {
  const font = isBold ? "Helvetica-Bold" : "Helvetica";
  doc
    .font(font)
    .fontSize(10)
    .fillColor("#000000");

  // Draw text with word wrapping
  const textObj = doc.text(safe(text), x + 8, y + 5, {
    width: width - 16,
    height: height - 10,
    align: "left",
    valign: "top",
  });

  return textObj.height || height;
}

// ─────────────────────────────────────────────────────────────────────────────
//  DRAW TABLE ROW
// ─────────────────────────────────────────────────────────────────────────────
function drawTableRow(doc, label, value, currentY, col1Width = 140, col2Width = 420) {
  let y = toNum(currentY);
  if (isNaN(y)) y = 100;

  const col2Start = col1Width;
  const pageHeight = doc.page.height;
  const bottomMargin = 80;

  // Estimate row height based on content
  let rowHeight = 40;

  // Check if content will exceed page
  if (y + rowHeight > pageHeight - bottomMargin) {
    doc.addPage();
    y = 50;
  }

  // Draw borders
  doc.strokeColor("#000000").lineWidth(1);

  // Left column border (label)
  doc
    .moveTo(50, y)
    .lineTo(50, y + rowHeight)
    .moveTo(50 + col1Width, y)
    .lineTo(50 + col1Width, y + rowHeight)
    .stroke();

  // Right column border (value)
  doc
    .moveTo(50 + col1Width + col2Width, y)
    .lineTo(50 + col1Width + col2Width, y + rowHeight)
    .stroke();

  // Top border
  doc
    .moveTo(50, y)
    .lineTo(50 + col1Width + col2Width, y)
    .stroke();

  // Bottom border
  doc
    .moveTo(50, y + rowHeight)
    .lineTo(50 + col1Width + col2Width, y + rowHeight)
    .stroke();

  // Middle vertical border
  doc
    .moveTo(50 + col1Width, y)
    .lineTo(50 + col1Width, y + rowHeight)
    .stroke();

  // Draw label (bold)
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor("#000000")
    .text(safe(label), 50 + 8, y + 8, {
      width: col1Width - 16,
      height: rowHeight - 16,
      align: "left",
      valign: "top",
    });

  // Draw value
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#000000")
    .text(safe(value), 50 + col1Width + 8, y + 8, {
      width: col2Width - 16,
      height: rowHeight - 16,
      align: "left",
      valign: "top",
    });

  return y + rowHeight;
}

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN GENERATOR
// ─────────────────────────────────────────────────────────────────────────────
function generateTermSheetPDF(doc, data) {
  let y = 30;

  // ── HEADER ──
  doc
    .font("Helvetica-Bold")
    .fontSize(18)
    .fillColor("#000000")
    .text("TERM SHEET SUMMARY", 50, y, { align: "left" });
  y += 35;

  // ── BASIC INFO ──
  const investors = (data.investors || [])
    .map(i => safe(i.name))
    .filter(Boolean)
    .join(", ") || "";

  const founders = (data.founders || [])
    .map(f => safe(f.name))
    .filter(Boolean)
    .join(", ") || "";

  const issuerName = safe(data.issuer?.name);
  const issuerAddr = safe(data.issuer?.address);
  const issuerInfo = issuerName + (issuerAddr ? `\n${issuerAddr}` : "");

  y = drawTableRow(doc, "Investor(s):", investors, y);
  y = drawTableRow(doc, "Issuers:", issuerInfo, y);
  y = drawTableRow(doc, "Founder(s):", founders, y);
  y = drawTableRow(doc, "Business:", safe(data.businessDescription), y);

  // ── VALUATION ──
  const preMoney = toNum(data.preMoneyValuation);
  const mandInv = toNum(data.mandatoryInvestment);
  const mandEq = toNum(data.mandatoryEquity);
  const optInv = toNum(data.optionalInvestment);
  const optEq = toNum(data.optionalEquity);

  const valuationText = preMoney > 0 
    ? `The pre-money valuation of the company would be Rs.${preMoney.toLocaleString("en-IN")}`
    : "";

  y = drawTableRow(doc, "Valuation of the company", valuationText, y);

  // ── INVESTMENT TEXT ──
  let invText = `The investment agreed to happen in two tranches, one mandatory investment of Rs.${mandInv.toLocaleString("en-IN")} in return of ${mandEq}% equity dilution for the first six months of operations`;

  if (optInv > 0) {
    invText += ` and then the optional investment of Rs.${optInv.toLocaleString("en-IN")} in return of ${optEq}% equity dilution. This optional investment is subject to the mutual consent of both parties.`;
  } else {
    invText += `.`;
  }

  y = drawTableRow(doc, "Amount of the Offering\n(Investment Amount requested):", invText, y);

  // ── SHARES & PRICE ──
  const totalShares = toNum(data.totalShares);
  const sharesText = totalShares > 0 
    ? `${totalShares.toLocaleString("en-IN")} shares (Total shares)`
    : "";

  y = drawTableRow(doc, "Number of Shares", sharesText, y);

  const priceText = data.instrumentPrice 
    ? `Rs.${toNum(data.instrumentPrice).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
    : "(Valuation report to be enclosed later)";

  y = drawTableRow(doc, "Price per Share", priceText, y);

  const dilutionText = mandEq > 0 ? `${mandEq}% in the current round of investment.` : "";
  y = drawTableRow(doc, "% of dilution", dilutionText, y);

  y = drawTableRow(doc, "Instrument Type", safe(data.instrumentType) || "Equity shares", y);

  // ── ADDITIONAL TERMS ──
  const addRow = (label, field) => {
    const val = safe(data[field]);
    if (val) y = drawTableRow(doc, label, val, y);
  };

  addRow("Liquidation Preference:", "liquidationPreference");
  addRow("Voting Rights:", "votingRights");
  addRow("Right to Maintain Capital (Pro-rata):", "rightToMaintainCapital");
  addRow("Transfer Rights:", "transferRights");
  if (data.exitDate) addRow("Exit Date:", formatDate(data.exitDate));
  addRow("Tag Along Rights:", "tagAlongRights");
  addRow("Anti-Dilution Protection:", "antiDilutionProtection");
  addRow("Protective Provisions:", "protectiveProvisions");
  addRow("Company Debts:", "companyDebts");
  addRow("Information Rights:", "informationRights");
  addRow("Drag Along Rights:", "dragAlongRights");
  addRow("Representations & Warranties:", "representationsWarranties");
  addRow("Governing Law:", "governingLaw");
  addRow("Dispute Resolution:", "disputeResolution");
  addRow("Existing Investor Rights:", "existingInvestorRights");

  // ── LOCK-IN ──
  if (data.founderLockIn) {
    y = drawTableRow(doc, "Founder Lock-in:", "Yes", y);
    addRow("Lock-in Details:", "lockInDetails");
  }

  // ── CLOSING DATE ──
  y = drawTableRow(doc, "Expected Closing Date:", formatDate(data.expectedClosingDate), y);

  // ── FOOTER ──
  const footerY = doc.page.height - 60;
  doc
    .font("Helvetica-Oblique")
    .fontSize(8)
    .fillColor("#666666")
    .text(
      "This is a non-binding summary of terms. All figures are subject to final due diligence. Legal documentation is required for execution.",
      50,
      footerY,
      { align: "left", width: 500 }
    );
}

module.exports = { generateTermSheetPDF };