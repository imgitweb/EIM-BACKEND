// utils/pdfGenerator.js
const PDFDocument = require("pdfkit");

// ─────────────────────────────────────────────────────────────────────────────
//  ULTRA-SAFE HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const safe = (v) => (v != null && v !== "" ? String(v).trim() : "");
const toNum = (v) => {
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
};
const formatINR = (v) => {
  const n = toNum(v);
  if (n <= 0) return "";
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
};
const formatDate = (d) => {
  if (!d) return "";
  const date = new Date(d);
  return isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
};

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION HEADER (इमेज के अनुसार स्टाइल किया गया)
// ─────────────────────────────────────────────────────────────────────────────
function drawSectionHeader(doc, title, currentY, isMain = true) {
  let y = toNum(currentY);
  const pageHeight = doc.page.height;
  const bottomMargin = 80;
  const marginLeft = 50;

  if (y + 30 > pageHeight - bottomMargin) {
    doc.addPage();
    y = 50;
  }

  if (isMain) {
    // Main Sections (e.g., SECTION 1)
    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .fillColor("#000000")
      .text(title, marginLeft, y);
  } else {
    // Sub-sections (e.g., 1.1, 2.1)
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor("#000000")
      .text(title, marginLeft, y);
  }
  return y + (isMain ? 15 : 12);
}

// ─────────────────────────────────────────────────────────────────────────────
//  DRAW CAPITALIZATION TABLE (कस्टम टेबल लॉजिक)
// ─────────────────────────────────────────────────────────────────────────────
function drawCapTable(doc, data, currentY, sectionTitle) {
  let y = toNum(currentY);
  const marginLeft = 50;
  const tableWidth = 510;
  const col1Width = 120; // Shareholder
  const col2Width = 140; // Shares/Amount
  const col3Width = 250; // % Ownership

  const rowHeight = 20; // Sub-section Header

  y = drawSectionHeader(doc, sectionTitle, y, false);
  doc.moveDown(0.2);
  y += 5; // 1. HEADER ROW

  doc.font("Helvetica-Bold").fontSize(10).fillColor("#000000");

  let currentX = marginLeft;
  let headerY = y; // Draw headers

  doc.text("Shareholder", currentX + 5, headerY + 4, { width: col1Width - 10 });
  currentX += col1Width;
  doc.text("Shares", currentX + 5, headerY + 4, { width: col2Width - 10 });
  currentX += col2Width;
  doc.text("% Ownership", currentX + 5, headerY + 4, { width: col3Width - 10 });
  currentX += col3Width; // Draw header borders

  doc.strokeColor("#000000").lineWidth(0.5);
  doc.rect(marginLeft, headerY, tableWidth, rowHeight).stroke();
  doc
    .moveTo(marginLeft + col1Width, headerY)
    .lineTo(marginLeft + col1Width, headerY + rowHeight)
    .stroke();
  doc
    .moveTo(marginLeft + col1Width + col2Width, headerY)
    .lineTo(marginLeft + col1Width + col2Width, headerY + rowHeight)
    .stroke();

  y += rowHeight; // 2. DATA ROWS

  doc.font("Helvetica").fontSize(10).fillColor("#000000");

  data.forEach((row) => {
    currentX = marginLeft;
    let dataY = y; // Draw text

    doc.text(safe(row.shareholder), currentX + 5, dataY + 4, {
      width: col1Width - 10,
    });
    currentX += col1Width;
    doc.text(safe(row.shares), currentX + 5, dataY + 4, {
      width: col2Width - 10,
    });
    currentX += col2Width;
    doc.text(safe(row.ownership), currentX + 5, dataY + 4, {
      width: col3Width - 10,
    });
    currentX += col3Width; // Draw row borders

    doc.rect(marginLeft, dataY, tableWidth, rowHeight).stroke();
    doc
      .moveTo(marginLeft + col1Width, dataY)
      .lineTo(marginLeft + col1Width, dataY + rowHeight)
      .stroke();
    doc
      .moveTo(marginLeft + col1Width + col2Width, dataY)
      .lineTo(marginLeft + col1Width + col2Width, dataY + rowHeight)
      .stroke();

    y += rowHeight;
  });

  return y + 15; // Extra space after table
}

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN GENERATOR (इमेज लेआउट के लिए अपडेटेड)
// ─────────────────────────────────────────────────────────────────────────────
function generateTermSheetPDF(doc, data) {
  let y = 50;
  const marginLeft = 50;

  // Placeholder Data (यदि data ऑब्जेक्ट में फील्ड्स खाली हैं तो उपयोग करने के लिए)
  const defaultData = {
    companyName: "ABC Private Pvt. Ltd.",
    cin: "[●]",
    registeredAddress: "[●]",
    contactPerson: "[●]",
    investorName: "Investor 1",
    investmentAmount: 20000000,
    preMoneyValuation: 80000000,
    vestingSchedule: "4 year vesting period with a 1 year cliff",
    esopPoolSize: 10,
    closingDate: new Date().toISOString(),
    governingLaw: "Laws of India",
    jurisdiction: "Courts of [City]",
  };

  // Data को defaultData के साथ मर्ज करें
  const D = { ...defaultData, ...data }; // ── TITLE & DATE ──

  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .fillColor("#1a365d")
    .text(
      "PRE-SEED FUNDRAISING TERMSHEET (CCD — Compulsorily Convertible",
      marginLeft,
      y
    );
  y += 12;
  doc.text("Debentures)", marginLeft, y, { underline: true });
  y += 20;

  doc.font("Helvetica").fontSize(10).fillColor("#000000");
  doc.text(`Date: [Insert Date]`, marginLeft, y);
  y += 20;

  doc.text(
    "This Termsheet outlines the principal terms agreed between the Company and the Investors. All terms are subject to final approval, execution of definitive legal documentation, satisfactory due diligence, corporate secretarial compliance, and regulatory compliance. This document is non-binding, except for the clauses on Exclusivity, Governing Law, Cost Reimbursement, and Confidentiality.",
    marginLeft,
    y,
    { width: 510, align: "justify" }
  );
  y = doc.y + 15; // ───────────────────────────────────────────────────────────────────────────── //  SECTION 1 — TRANSACTION DETAILS // ─────────────────────────────────────────────────────────────────────────────

  y = drawSectionHeader(doc, "SECTION 1 — TRANSACTION DETAILS", y);
  doc.moveDown(0.5);
  y += 5; // 1.1 Company & Founder Details

  y = drawSectionHeader(doc, "1.1 Company & Founder Details", y, false);
  doc.moveDown(0.2);

  doc
    .font("Helvetica")
    .fontSize(10)
    .list(
      [
        `Company: ${safe(D.companyName)}`,
        `CIN: ${safe(D.cin)}`,
        `Registered/Corp. Office: ${safe(D.registeredAddress)}`,
        `Founders:`,
      ],
      marginLeft + 10,
      doc.y,
      { lineGap: 3, bulletRadius: 2, bulletIndent: 10 }
    );
  y = doc.y + 5; // Inner founder list

  doc
    .font("Helvetica")
    .fontSize(10)
    .list(
      [
        `Founder A — 50,000 equity shares (50%)`,
        `Founder B — 50,000 equity shares (50%)`,
      ],
      marginLeft + 30,
      doc.y,
      { lineGap: 3, bulletRadius: 2, bulletIndent: 10 }
    );
  y = doc.y + 10; // 1.2 Investment & Valuation

  y = drawSectionHeader(doc, "1.2 Investment & Valuation", y, false);
  doc.moveDown(0.2);

  // NOTE: Assuming two investors for the image layout
  doc
    .font("Helvetica")
    .fontSize(10)
    .list(
      [
        `Investors: ${safe(D.investorName)} — ${formatINR(
          D.investmentAmount / 2
        )}`,
        `Investors: Investor 2 — ${formatINR(D.investmentAmount / 2)}`,
        `Pre-Money Valuation: ${formatINR(D.preMoneyValuation)}`,
        `Total Investment: ${formatINR(D.investmentAmount)}`,
      ],
      marginLeft + 10,
      doc.y,
      { lineGap: 3, bulletRadius: 2, bulletIndent: 10 }
    );
  y = doc.y + 10; // 1.3 Instrument

  y = drawSectionHeader(doc, "1.3 Instrument", y, false);
  doc.moveDown(0.2);

  doc
    .font("Helvetica")
    .fontSize(10)
    .text(
      `CCD is a debt-like instrument that mandatorily converts into equity at a specified time or at the next funding event, whichever is earlier. Conversion shall be on the terms of the Shareholders’ Agreement, Articles, and Liquidation Preference. CCD holders become Shareholders only upon conversion.`,
      marginLeft + 10,
      doc.y,
      { width: 500, align: "justify" }
    );
  y = doc.y + 15; // ───────────────────────────────────────────────────────────────────────────── //  SECTION 2 — CAPITALIZATION TABLE // ─────────────────────────────────────────────────────────────────────────────

  y = drawSectionHeader(doc, "SECTION 2 — CAPITALIZATION TABLE", y);
  doc.moveDown(0.5);
  y += 5; // 2.1 Pre-Investment Cap Table

  const preCapTableData = [
    { shareholder: "Founder A", shares: "50,000", ownership: "50%" },
    { shareholder: "Founder B", shares: "50,000", ownership: "50%" },
    { shareholder: "TOTAL", shares: "1,00,000", ownership: "100%" },
  ];
  y = drawCapTable(doc, preCapTableData, y, "2.1 Pre-Investment Cap Table"); // 2.2 Post-Investment Cap Table

  const postCapTableData = [
    { shareholder: "Founder A", shares: "50,000", ownership: "Varies" },
    { shareholder: "Founder B", shares: "50,000", ownership: "Varies" },
    { shareholder: "CCD on conversion", shares: "Varies", ownership: "Varies" },
    { shareholder: "TOTAL", shares: "Dynamic", ownership: "100%" },
  ];
  y = drawCapTable(doc, postCapTableData, y, "2.2 Post-Investment Cap Table"); // ───────────────────────────────────────────────────────────────────────────── //  SECTION 3 — INVESTOR RIGHTS // ─────────────────────────────────────────────────────────────────────────────

  y = drawSectionHeader(doc, "SECTION 3 — INVESTOR RIGHTS", y);
  doc.moveDown(0.5);
  y += 5;

  doc
    .font("Helvetica")
    .fontSize(10)
    .text(
      `Rights include (but not limited to) Information Rights, Pro-Rata Rights, Board Observer Rights, Top-Along and Drag-Along Rights depending on the Investment Amount and Valuation.`,
      marginLeft,
      doc.y,
      { width: 510, align: "justify" }
    );
  y = doc.y + 15; // ───────────────────────────────────────────────────────────────────────────── //  SECTION 4 — OBLIGATIONS OF FOUNDERS & COMPANY // ─────────────────────────────────────────────────────────────────────────────

  y = drawSectionHeader(
    doc,
    "SECTION 4 — OBLIGATIONS OF FOUNDERS & COMPANY",
    y
  );
  doc.moveDown(0.5);
  y += 5;

  doc
    .font("Helvetica")
    .fontSize(10)
    .list(
      [
        `Founders’ shares to be subject to a vesting schedule.`,
        `Full-time commitment required.`,
        `No outside debt or encumbrance.`,
        `ESOP pool creation up to ${safe(D.esopPoolSize)}% post-money.`,
      ],
      marginLeft + 10,
      doc.y,
      { lineGap: 3, bulletRadius: 2, bulletIndent: 10 }
    );
  y = doc.y + 15; // ───────────────────────────────────────────────────────────────────────────── //  SECTION 5 — CONDITIONS PRECEDENT // ─────────────────────────────────────────────────────────────────────────────

  y = drawSectionHeader(doc, "SECTION 5 — CONDITIONS PRECEDENT", y);
  doc.moveDown(0.5);
  y += 5;

  doc
    .font("Helvetica")
    .fontSize(10)
    .text(
      `Conditions Precedent include execution of definitive agreements, cap table certification, corporate approvals, compliance with all statutory requirements including RBI filings, share issuance formalities, and record updates.`,
      marginLeft,
      doc.y,
      { width: 510, align: "justify" }
    );
  y = doc.y + 15; // ───────────────────────────────────────────────────────────────────────────── //  SECTION 6 — MISCELLANEOUS // ─────────────────────────────────────────────────────────────────────────────

  y = drawSectionHeader(doc, "SECTION 6 — MISCELLANEOUS", y);
  doc.moveDown(0.5);
  y += 5;

  doc
    .font("Helvetica")
    .fontSize(10)
    .list(
      [
        `Confidentiality for all parties.`,
        `Exclusivity for [●] days.`,
        `Termsheet is non-binding except specified clauses.`,
        `Governing Law: ${safe(D.governingLaw)}.`,
        `Jurisdiction: ${safe(D.jurisdiction)}.`,
      ],
      marginLeft + 10,
      doc.y,
      { lineGap: 3, bulletRadius: 2, bulletIndent: 10 }
    );
  y = doc.y + 25; // ───────────────────────────────────────────────────────────────────────────── //  SIGNATURE BLOCK // ───────────────────────────────────────────────────────────────────────────── // Helper function for signature lines

  const drawSignatureBlock = (doc, currentY, label) => {
    const lineY = currentY + 15;
    const lineX = doc.x + 5;
    const lineLength = 200;

    doc.font("Helvetica").fontSize(10).text(label, lineX, currentY);
    doc
      .moveTo(lineX, lineY)
      .lineTo(lineX + lineLength, lineY)
      .stroke();
  };

  // Set current Y for signatures
  const signatureY = y;

  // Column 1: Company and Founder Signatures
  let col1Y = signatureY;
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("For the Company:", marginLeft, col1Y);
  col1Y += 20;
  drawSignatureBlock(doc, col1Y, safe(D.companyName));
  col1Y += 40;
  drawSignatureBlock(doc, col1Y, "Designation:");
  col1Y += 40;

  col1Y += 15;
  drawSignatureBlock(doc, col1Y, "Founder A:");
  col1Y += 40;
  drawSignatureBlock(doc, col1Y, "Founder B:");
  col1Y += 40;

  // Column 2: Investor Signatures
  let col2Y = signatureY;
  const col2X = 330;

  doc.font("Helvetica-Bold").fontSize(10).text("Investors:", col2X, col2Y);
  col2Y += 20;

  drawSignatureBlock(doc, col2Y, "Investor 1:");
  col2Y += 40;
  drawSignatureBlock(doc, col2Y, "Investor 2:");
  col2Y += 40; // ── FOOTER ── (Page 2)

  const footerY = doc.page.height - 40;
  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor("#666666")
    .text(
      "This Termsheet is non-binding, except for the clauses on Exclusivity, Governing Law, Cost Reimbursement, and Confidentiality. This is not an offer to sell or a solicitation of an offer to purchase securities. All figures are subject to final due diligence.",
      50,
      footerY,
      { align: "left", width: 500 }
    );
}

module.exports = { generateTermSheetPDF };
