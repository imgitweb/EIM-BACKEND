// Function to format Indian Rupee (INR) currency
const formatINR = (value) => {
  if (typeof value !== "number") return "N/A";
  // Use en-US locale for number formatting but keep the Rupee symbol and specific Indian formatting
  // A professional term sheet would typically use USD, but keeping INR as per the original function's name and locale ('en-IN')
  return `₹ ${new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(value)}`;
};

// Function to format the date
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  // Using en-US locale for American date format (Month Day, Year)
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Draws a labeled row
function drawRow(doc, label, value, xLabel, xValue, y) {
  doc.font("Helvetica-Bold").fontSize(10).text(label, xLabel, y);
  doc.font("Helvetica").fontSize(10).text(value, xValue, y);
  return doc.currentLineHeight() + 4; // Returns the row height
}

// Draws a section title
function drawSectionTitle(doc, title, y) {
  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .fillColor("#7928CA") // Purple color from the app
    .text(title, 50, y);
  
  // Draws a line under the title
  doc
    .strokeColor("#7928CA")
    .lineWidth(1)
    .moveTo(50, y + 20)
    .lineTo(550, y + 20)
    .stroke();
    
  return y + 35; // New Y position
}

function generateTermSheetPDF(doc, data) {
  
  const xLabel = 50;
  const xValue = 250;
  let y = 50; // Current Y position

  // --- Header ---
  doc
    .font("Helvetica-Bold")
    .fontSize(20)
    .fillColor("#333333")
    .text("TERM SHEET SUMMARY", 50, y, { align: "center" });
  y += 50;

  // --- Section 1: Parties and Business ---
  y = drawSectionTitle(doc, "I. PARTIES AND BUSINESS", y);
  
  let investors = data.investors.map((i) => i.name).join(", ") || "N/A";
  let founders = data.founders.map((f) => f.name).join(", ") || "N/A";
  
  y += drawRow(doc, "Investor(s):", investors, xLabel, xValue, y);
  y += drawRow(doc, "Company (Issuer):", data.issuer.name || "N/A", xLabel, xValue, y);
  y += drawRow(doc, "Address:", data.issuer.address || "N/A", xLabel, xValue, y);
  y += drawRow(doc, "Founder(s):", founders, xLabel, xValue, y);
  
  // Business Description field (multiline)
  y += drawRow(doc, "Business Description:", "", xLabel, xValue, y);
  doc
    .font("Helvetica")
    .fontSize(10)
    .text(data.businessDescription || "N/A", xLabel + 20, y, { // Indented
      width: 480,
      align: "justify",
    });
  y = doc.y + 20; 

  // --- Section 2: Financial Terms ---
  y = drawSectionTitle(doc, "II. FINANCIAL TERMS", y);
  
  const postMoney = (data.preMoneyValuation || 0) + (data.mandatoryInvestment || 0);

  y += drawRow(doc, "Pre-Money Valuation:", formatINR(data.preMoneyValuation), xLabel, xValue, y);
  y += drawRow(doc, "Post-Money Valuation:", formatINR(postMoney), xLabel, xValue, y);
  y += drawRow(doc, "Mandatory Investment:", `${formatINR(data.mandatoryInvestment)} for ${data.mandatoryEquity || 0}% of equity`, xLabel, xValue, y);
  y += drawRow(doc, "Optional Investment:", `${formatINR(data.optionalInvestment)} (subject to consent)`, xLabel, xValue, y);

  // --- Section 3: Shares and Instrument ---
  y = drawSectionTitle(doc, "III. SHARES AND INSTRUMENT", y);
  
  // Use en-US locale for comma separation
  const shares = data.totalShares ? data.totalShares.toLocaleString("en-US") : "N/A"; 
  const sharesForMand = (data.totalShares || 0) * ((data.mandatoryEquity || 0) / 100);
  const pricePerShare = sharesForMand > 0 ? (data.mandatoryInvestment || 0) / sharesForMand : 0;

  y += drawRow(doc, "Total Shares (Pre-Deal):", shares, xLabel, xValue, y);
  y += drawRow(doc, "Instrument Type:", data.instrumentType || "N/A", xLabel, xValue, y);
  y += drawRow(doc, "Price Per Share:", formatINR(pricePerShare), xLabel, xValue, y);

  // --- Section 4: Key Clauses ---
  y = drawSectionTitle(doc, "IV. KEY CLAUSES", y);
  
  y += drawRow(doc, "Expected Closing Date:", formatDate(data.expectedClosingDate), xLabel, xValue, y);
  y += drawRow(doc, "Founder Lock-in:", data.founderLockIn ? "Yes" : "No", xLabel, xValue, y);
  
  if (data.founderLockIn) {
    y += drawRow(doc, "Lock-in Details:", "", xLabel, xValue, y);
    doc
      .font("Helvetica")
      .fontSize(10)
      .text(data.lockInDetails || "N/A", xLabel + 20, y, {
        width: 480,
        align: "justify",
      });
  }

  // --- Footer (Disclaimer) ---
  y = doc.page.height - 100; // Go to the bottom of the page
  doc
    .strokeColor("#AAAAAA")
    .lineWidth(1)
    .moveTo(50, y)
    .lineTo(550, y)
    .stroke();
  y += 10;
  
  doc
    .font("Helvetica-Oblique")
    .fontSize(8)
    .fillColor("#555555")
    .text(
      "This is a non-binding summary of terms. All figures are subject to final due diligence. Legal documentation is required for execution. Consult with legal counsel before signing.",
      50,
      y,
      { align: "center", width: 500 }
    );
}

module.exports = { generateTermSheetPDF };