// utils/advancedPdfGenerator.js
const PDFDocument = require("pdfkit");

// ─────────────────────────────────────────────────────────────────────────────
//  SAFE HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const safe = (v) => (v != null && v !== "" ? String(v).trim() : "[●]");
const toNum = (v) => {
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
};
const formatINR = (v) => {
  const n = toNum(v);
  if (n <= 0) return "[●]";
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
};
const formatDate = (d) => {
  if (!d) return "[●]";
  const date = new Date(d);
  return isNaN(date.getTime())
    ? "[●]"
    : date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
};
const formatPercent = (v) => {
  const n = toNum(v);
  return n > 0 ? `${n.toFixed(2)}%` : "[●]";
};

// ─────────────────────────────────────────────────────────────────────────────
//  PAGE MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────
const MARGIN_LEFT = 50;
const MARGIN_RIGHT = 50;
const MARGIN_TOP = 40;
const MARGIN_BOTTOM = 60;
const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

function checkPageBreak(doc, yPos, spaceNeeded = 50) {
  if (yPos + spaceNeeded > PAGE_HEIGHT - MARGIN_BOTTOM) {
    doc.addPage();
    addPageHeader(doc);
    return MARGIN_TOP + 30;
  }
  return yPos;
}

function addPageHeader(doc) {
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor("#7c3aed")
    .text("TERM SHEET - CONFIDENTIAL", MARGIN_LEFT, 20, { width: CONTENT_WIDTH });

  // Page number
  const pages = doc.bufferedPageRange().count;
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor("#999999")
    .text(`Page ${pages}`, PAGE_WIDTH - 100, 20, { width: 50, align: "right" });
}

// ─────────────────────────────────────────────────────────────────────────────
//  TEXT DRAWING FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────
function drawMainHeading(doc, text, yPos) {
  yPos = checkPageBreak(doc, yPos, 30);

  doc
    .font("Helvetica-Bold")
    .fontSize(13)
    .fillColor("#1a365d")
    .text(text, MARGIN_LEFT, yPos);

  // Underline
  doc
    .strokeColor("#7c3aed")
    .lineWidth(2)
    .moveTo(MARGIN_LEFT, doc.y + 5)
    .lineTo(MARGIN_LEFT + CONTENT_WIDTH, doc.y + 5)
    .stroke();

  return doc.y + 15;
}

function drawSubHeading(doc, text, yPos) {
  yPos = checkPageBreak(doc, yPos, 20);

  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor("#374151")
    .text(text, MARGIN_LEFT, yPos);

  return doc.y + 8;
}

function drawBulletPoint(doc, text, yPos, indent = 0) {
  yPos = checkPageBreak(doc, yPos, 20);

  const xPos = MARGIN_LEFT + indent * 15;
  const textWidth = CONTENT_WIDTH - indent * 15;

  // Draw bullet
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor("#7c3aed")
    .text("•", xPos, yPos);

  // Draw text
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#1f2937")
    .text(text, xPos + 15, yPos, { width: textWidth - 15 });

  return doc.y + 5;
}

function drawKeyValue(doc, key, value, yPos) {
  yPos = checkPageBreak(doc, yPos, 18);

  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor("#1f2937")
    .text(key, MARGIN_LEFT, yPos, { width: 200 });

  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#374151")
    .text(safe(value), MARGIN_LEFT + 210, yPos, { width: CONTENT_WIDTH - 210 });

  return doc.y + 6;
}

function drawTable(doc, headers, rows, yPos) {
  yPos = checkPageBreak(doc, yPos, 60);

  const tableWidth = CONTENT_WIDTH;
  const colWidths = [150, 150, 155];
  const rowHeight = 22;

  // Header
  doc.rect(MARGIN_LEFT, yPos, tableWidth, rowHeight).fillAndStroke("#7c3aed", "#000000");
  doc
    .font("Helvetica-Bold")
    .fontSize(9)
    .fillColor("#ffffff");

  let xPos = MARGIN_LEFT;
  headers.forEach((header, i) => {
    doc.text(header, xPos + 5, yPos + 6, { width: colWidths[i] - 10 });
    xPos += colWidths[i];
  });

  yPos += rowHeight;

  // Rows
  doc.fillColor("#000000");
  rows.forEach((row) => {
    if (yPos + rowHeight > PAGE_HEIGHT - MARGIN_BOTTOM) {
      doc.addPage();
      addPageHeader(doc);
      yPos = MARGIN_TOP + 30;
    }

    doc.rect(MARGIN_LEFT, yPos, tableWidth, rowHeight).stroke();

    xPos = MARGIN_LEFT;
    row.forEach((cell, i) => {
      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor("#374151")
        .text(safe(cell), xPos + 5, yPos + 6, { width: colWidths[i] - 10 });
      xPos += colWidths[i];
    });

    yPos += rowHeight;
  });

  return yPos + 12;
}

function drawSection(doc, title, content, yPos) {
  yPos = drawSubHeading(doc, title, yPos);

  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#1f2937")
    .text(content, MARGIN_LEFT, yPos, {
      width: CONTENT_WIDTH,
      align: "justify",
    });

  return doc.y + 8;
}

function drawSignatureBlock(doc, label, yPos) {
  yPos = checkPageBreak(doc, yPos, 50);

  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor("#000000")
    .text(label, MARGIN_LEFT, yPos);

  doc
    .moveTo(MARGIN_LEFT, yPos + 25)
    .lineTo(MARGIN_LEFT + 150, yPos + 25)
    .stroke();

  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor("#666666")
    .text("(Signature)", MARGIN_LEFT, yPos + 27);

  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor("#666666")
    .text("(Date)", MARGIN_LEFT + 100, yPos + 27);

  return yPos + 45;
}

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN PDF GENERATOR
// ─────────────────────────────────────────────────────────────────────────────
function generateTermSheetPDF(doc, data) {
  let y = MARGIN_TOP;

  // Add page header on first page
  addPageHeader(doc);

  // ───────────────────────── COVER PAGE ───────────────────────────
  y = drawMainHeading(doc, "INVESTMENT TERM SHEET", y);

  doc
    .font("Helvetica")
    .fontSize(11)
    .fillColor("#7c3aed")
    .text(`${safe(data.instrumentType)}`, MARGIN_LEFT, y);
  y = doc.y + 20;

  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#1f2937")
    .text("Investment Agreement between Company and Investor", MARGIN_LEFT, y, {
      width: CONTENT_WIDTH,
    });
  y = doc.y + 30;

  y = drawKeyValue(doc, "Company:", data.companyName, y);
  y = drawKeyValue(doc, "Investor:", data.investorName, y);
  y = drawKeyValue(doc, "Date:", formatDate(new Date()), y);
  y = drawKeyValue(doc, "Instrument:", data.instrumentType, y);

  y = checkPageBreak(doc, y, 40);

  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor("#666666")
    .text(
      "This Term Sheet outlines the principal terms and conditions for the proposed investment. All terms are subject to final due diligence, execution of definitive documentation, regulatory approvals, and board/shareholder consents.",
      MARGIN_LEFT,
      y,
      { width: CONTENT_WIDTH, align: "justify" }
    );

  y = doc.y + 20;

  // ───────────────────────── SECTION 1 ───────────────────────────
  y = drawMainHeading(doc, "SECTION 1: COMPANY & INVESTOR DETAILS", y);

  y = drawSubHeading(doc, "1.1 Company Information", y);
  y = drawKeyValue(doc, "Company Name:", data.companyName, y);
  y = drawKeyValue(doc, "CIN:", data.cin, y);
  y = drawKeyValue(doc, "Registered Address:", data.registeredAddress, y);
  y = drawKeyValue(doc, "Contact Person:", data.contactPerson, y);

  y = drawSubHeading(doc, "1.2 Investor Information", y);
  y = drawKeyValue(doc, "Investor Name:", data.investorName, y);
  y = drawKeyValue(doc, "Investor Type:", data.investorType, y);

  // ───────────────────────── SECTION 2 ───────────────────────────
  y = drawMainHeading(doc, "SECTION 2: INVESTMENT TERMS", y);

  y = drawSubHeading(doc, "2.1 Transaction Details", y);
  y = drawKeyValue(doc, "Instrument Type:", data.instrumentType, y);
  y = drawKeyValue(doc, "Round Type:", data.roundType, y);
  y = drawKeyValue(doc, "Investment Amount:", formatINR(data.investmentAmount), y);

  y = drawSubHeading(doc, "2.2 Valuation Summary", y);
  y = drawKeyValue(doc, "Pre-Money Valuation:", formatINR(data.preMoneyValuation), y);

  const postMoney = toNum(data.preMoneyValuation) + toNum(data.investmentAmount);
  y = drawKeyValue(doc, "Post-Money Valuation:", formatINR(postMoney), y);

  const equityDilution =
    postMoney > 0
      ? ((toNum(data.investmentAmount) / postMoney) * 100).toFixed(2)
      : 0;
  y = drawKeyValue(doc, "Equity Dilution (%):", formatPercent(equityDilution), y);

  const pricePerShare =
    data.totalSharesPre && data.preMoneyValuation
      ? (toNum(data.preMoneyValuation) / toNum(data.totalSharesPre)).toFixed(2)
      : 0;
  y = drawKeyValue(doc, "Price per Share:", formatINR(pricePerShare), y);

  const sharesToBeIssued =
    data.investmentAmount && pricePerShare > 0
      ? (toNum(data.investmentAmount) / toNum(pricePerShare)).toFixed(0)
      : 0;
  y = drawKeyValue(doc, "Shares to be Issued:", sharesToBeIssued, y);

  // ───────────────────────── SECTION 3 ───────────────────────────
  y = drawMainHeading(doc, "SECTION 3: CAPITALIZATION TABLE", y);

  y = drawSubHeading(doc, "3.1 Shareholding Structure", y);

  const capTableHeaders = ["Shareholder", "Shares (Pre)", "Ownership (%)"];
  const capTableData = [
    ["Founder A", data.totalSharesPre ? Math.round(toNum(data.totalSharesPre) / 2) : "50000", "50"],
    ["Founder B", data.totalSharesPre ? Math.round(toNum(data.totalSharesPre) / 2) : "50000", "50"],
    ["TOTAL (Pre)", data.totalSharesPre || "100000", "100"],
  ];

  y = drawTable(doc, capTableHeaders, capTableData, y);

  y = drawSubHeading(doc, "3.2 Post-Investment Structure", y);

  const postCapTableData = [
    ["Founder A", Math.round(toNum(data.totalSharesPre) / 2), ((50 * (100 - equityDilution)) / 100).toFixed(1)],
    ["Founder B", Math.round(toNum(data.totalSharesPre) / 2), ((50 * (100 - equityDilution)) / 100).toFixed(1)],
    [safe(data.investorName), sharesToBeIssued, equityDilution],
    ["TOTAL (Post)", (toNum(data.totalSharesPre) + toNum(sharesToBeIssued)).toFixed(0), "100"],
  ];

  y = drawTable(doc, ["Shareholder", "Shares (Post)", "Ownership (%)"], postCapTableData, y);

  // ───────────────────────── SECTION 4 ───────────────────────────
  y = drawMainHeading(doc, `SECTION 4: ${data.instrumentType.toUpperCase()} SPECIFIC TERMS`, y);

  if (data.liquidationPreference) {
    y = drawKeyValue(doc, "Liquidation Preference:", data.liquidationPreference, y);
  }
  if (data.antiDilution) {
    y = drawKeyValue(doc, "Anti-Dilution Protection:", data.antiDilution, y);
  }
  if (data.proRataRights) {
    y = drawKeyValue(doc, "Pro-Rata Rights:", data.proRataRights, y);
  }
  if (data.votingRights) {
    y = drawKeyValue(doc, "Voting Rights:", data.votingRights, y);
  }
  if (data.inspectionRights) {
    y = drawKeyValue(doc, "Inspection Rights:", data.inspectionRights, y);
  }

  if (data.boardRepresentation) {
    y = drawKeyValue(doc, "Board Representation:", data.boardRepresentation, y);
  }
  if (data.conversionRatio) {
    y = drawKeyValue(doc, "Conversion Ratio:", data.conversionRatio, y);
  }
  if (data.conversionTrigger) {
    y = drawKeyValue(doc, "Conversion Trigger:", data.conversionTrigger, y);
  }

  // ───────────────────────── SECTION 5 ───────────────────────────
  y = drawMainHeading(doc, "SECTION 5: INVESTOR RIGHTS & GOVERNANCE", y);

  y = drawSubHeading(doc, "5.1 Board & Governance Rights", y);

  if (data.boardSeat === true || data.boardSeat === "true") {
    y = drawBulletPoint(doc, `Board Seat: ${data.boardSeatCount ? data.boardSeatCount + " seat(s)" : "1 seat"}`, y);
  } else {
    y = drawBulletPoint(doc, "Board Seat: No", y);
  }

  if (data.boardObserver === true || data.boardObserver === "true") {
    y = drawBulletPoint(doc, "Board Observer Rights: Yes", y);
  }

  y = drawSubHeading(doc, "5.2 Information & Protective Rights", y);

  if (data.informationRights) {
    y = drawBulletPoint(doc, `Information Rights: ${data.informationRights}`, y);
  } else {
    y = drawBulletPoint(doc, "Information Rights: Quarterly MIS", y);
  }

  if (data.protectiveProvisions) {
    y = drawBulletPoint(doc, `Protective Provisions: Yes`, y);
  } else {
    y = drawBulletPoint(doc, "Protective Provisions: Standard reserved matters", y);
  }

  if (data.dragAlongThreshold) {
    y = drawBulletPoint(
      doc,
      `Drag-Along Threshold: ${formatPercent(data.dragAlongThreshold)} shareholder majority`,
      y
    );
  }

  // ───────────────────────── SECTION 6 ───────────────────────────
  y = drawMainHeading(doc, "SECTION 6: COMPANY OBLIGATIONS", y);

  y = drawSubHeading(doc, "6.1 Founder Commitments", y);

  if (data.founderCommitment === true || data.founderCommitment === "true") {
    y = drawBulletPoint(doc, "Full-Time Commitment: Confirmed", y);
  } else {
    y = drawBulletPoint(doc, "Full-Time Commitment: Required", y);
  }

  if (data.vestingSchedule) {
    y = drawBulletPoint(doc, `Vesting Schedule: ${data.vestingSchedule}`, y);
  } else {
    y = drawBulletPoint(doc, "Vesting Schedule: 4-year with 1-year cliff", y);
  }

  y = drawSubHeading(doc, "6.2 Capital Structure Management", y);

  if (data.esopPoolSize) {
    y = drawBulletPoint(doc, `ESOP Pool Size: ${formatPercent(data.esopPoolSize)} of post-money`, y);
  } else {
    y = drawBulletPoint(doc, "ESOP Pool Size: Up to 10% of post-money valuation", y);
  }

  y = drawBulletPoint(doc, "No additional issuances without investor consent", y);

  y = drawSubHeading(doc, "6.3 Operational Covenants", y);

  if (data.managementCovenants) {
    y = drawBulletPoint(doc, `Management Covenants: ${data.managementCovenants}`, y);
  } else {
    y = drawBulletPoint(doc, "Company shall maintain financial controls and reporting", y);
  }

  if (data.reportingObligations) {
    y = drawBulletPoint(doc, `Reporting Requirements: ${data.reportingObligations}`, y);
  } else {
    y = drawBulletPoint(doc, "Quarterly financial statements and annual audit", y);
  }

  if (data.debtRestrictions) {
    y = drawBulletPoint(doc, `Debt Restrictions: ${data.debtRestrictions}`, y);
  } else {
    y = drawBulletPoint(doc, "No external debt without investor approval", y);
  }

  // ───────────────────────── SECTION 7 ───────────────────────────
  y = drawMainHeading(doc, "SECTION 7: CONDITIONS & CLOSING", y);

  y = drawSubHeading(doc, "7.1 Closing Timeline", y);
  y = drawKeyValue(doc, "Expected Closing Date:", formatDate(data.closingDate), y);

  if (data.conditionsPrecedent) {
    y = drawSubHeading(doc, "7.2 Conditions Precedent", y);
    y = drawBulletPoint(doc, data.conditionsPrecedent, y);
  } else {
    y = drawSubHeading(doc, "7.2 Conditions Precedent", y);
    y = drawBulletPoint(doc, "Execution of definitive legal documents", y);
    y = drawBulletPoint(doc, "Cap table certification and share approvals", y);
    y = drawBulletPoint(doc, "Compliance with all regulatory requirements", y);
  }

  if (data.conditionsSubsequent) {
    y = drawSubHeading(doc, "7.3 Conditions Subsequent", y);
    y = drawBulletPoint(doc, data.conditionsSubsequent, y);
  } else {
    y = drawSubHeading(doc, "7.3 Conditions Subsequent", y);
    y = drawBulletPoint(doc, "Share certificate issuance", y);
    y = drawBulletPoint(doc, "Board seat/observer appointment", y);
  }

  // ───────────────────────── SECTION 8 ───────────────────────────
  y = drawMainHeading(doc, "SECTION 8: REPRESENTATIONS & WARRANTIES", y);

  y = drawSubHeading(doc, "8.1 Company Representations", y);

  const repsWarranties = [
    { value: data.companiesActCompliance, text: "Company complies with Companies Act, 2013" },
    { value: data.femaCompliance, text: "FEMA compliance verified (if applicable)" },
    { value: data.noLitigation, text: "No material litigation or legal disputes pending" },
    { value: data.noOtherTermsheet, text: "No conflicting investment agreements exist" },
    { value: data.ipOwnership, text: "Company owns all material intellectual property" },
    { value: data.founderDocs, text: "Founders will execute all necessary legal documents" },
    { value: data.taxCompliance, text: "Company is compliant with all tax obligations" },
  ];

  repsWarranties.forEach((rep) => {
    if (rep.value === true || rep.value === "true") {
      y = drawBulletPoint(doc, `✓ ${rep.text}`, y);
    } else {
      y = drawBulletPoint(doc, `○ ${rep.text}`, y);
    }
  });

  // ───────────────────────── SECTION 9 ───────────────────────────
  y = drawMainHeading(doc, "SECTION 9: GOVERNING LAW & JURISDICTION", y);

  y = drawKeyValue(doc, "Governing Law:", "Laws of India", y);
  y = drawKeyValue(doc, "Jurisdiction:", "Courts of India", y);
  y = drawKeyValue(doc, "Dispute Resolution:", "Mutual negotiation followed by arbitration if required", y);

  // ───────────────────────── SIGNATURES ───────────────────────────
  y = drawMainHeading(doc, "EXECUTION", y);

  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor("#666666")
    .text(
      "By signing below, all parties confirm their agreement to the terms contained herein, subject to the conditions mentioned.",
      MARGIN_LEFT,
      y,
      { width: CONTENT_WIDTH, align: "justify" }
    );
  y = doc.y + 15;

  // Company signature
  y = drawSignatureBlock(doc, `For & On Behalf of ${safe(data.companyName)}`, y);
  y += 5;
  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor("#666666")
    .text("Authorized Signatory", MARGIN_LEFT, y);

  // Investor signature
  y = checkPageBreak(doc, y + 10, 50);
  y = drawSignatureBlock(doc, `For & On Behalf of ${safe(data.investorName)}`, y);
  y += 5;
  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor("#666666")
    .text("Authorized Signatory", MARGIN_LEFT, y);

  // Footer
  const footerY = PAGE_HEIGHT - 50;
  doc
    .font("Helvetica")
    .fontSize(7)
    .fillColor("#999999")
    .text(
      "This Term Sheet is confidential and non-binding except for Confidentiality, Exclusivity, Governing Law, and Cost Reimbursement clauses. This is not an offer to sell securities.",
      MARGIN_LEFT,
      footerY,
      { width: CONTENT_WIDTH, align: "center" }
    );
}

module.exports = { generateTermSheetPDF };