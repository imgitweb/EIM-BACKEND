const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// ==========================================
// 1. IMPORTS & CONFIGURATION
// ==========================================

const sendConfirmationEmail = require("./confirmMails.js"); // ईमेल भेजने वाला फंक्शन

const EXCEL_FILE = path.join(__dirname, "shortlist.xlsx");
const OUTPUT_JSON = "selectstartup.json"; // हिस्ट्री फाइल

// Gmail Block से बचने के लिए डिले (2 सेकंड)
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ==========================================
// 2. MAIN BULK PROCESS
// ==========================================
const startBulkProcess = async () => {
  try {
    console.log("🚀 Starting Bulk Email Process (Direct Mode)...\n");

    // --- Read Excel File ---
    if (!fs.existsSync(EXCEL_FILE)) {
      throw new Error(`❌ Excel file '${EXCEL_FILE}' not found!`);
    }

    const readWorkbook = XLSX.readFile(EXCEL_FILE);
    let allCandidates = [];

    // --- Load Data from All Sheets ---
    readWorkbook.SheetNames.forEach((sheetName) => {
      const sheetData = XLSX.utils.sheet_to_json(
        readWorkbook.Sheets[sheetName]
      );
      console.log(
        `📄 Sheet Loaded: ${sheetName} (${sheetData.length} records)`
      );
      allCandidates = [...allCandidates, ...sheetData];
    });

    console.log(`\n📂 Total Candidates in Excel: ${allCandidates.length}\n`);

    // --- Load Previous History (Duplicate Check) ---
    let previouslySent = [];
    if (fs.existsSync(OUTPUT_JSON)) {
      try {
        previouslySent = JSON.parse(fs.readFileSync(OUTPUT_JSON, "utf-8"));
        console.log(
          `📜 History Loaded: ${previouslySent.length} already sent.`
        );
      } catch (err) {}
    }

    let successList = [];
    let failedList = [];
    let skippedCount = 0;

    // --- Loop Through All Data ---
    for (const [index, row] of allCandidates.entries()) {
      // 1️⃣ Extract Email (Handle different headers)
      const rawEmail =
        row.Email || row.email || row["Email ID"] || row["Email Id"];
      const targetEmail = rawEmail ? rawEmail.toString().trim() : null;

      // 2️⃣ Extract Phone (For checking duplicates)
      const rawPhone =
        row.Phone || row.phone || row["Mobile"] || row["Mobile Number"];
      const targetPhone = rawPhone ? String(rawPhone).trim() : null;

      // 3️⃣ Extract Name (Handle "First Name" + "Last Name" OR "Founder Name")
      let targetName = "Innovator";
      if (row["First Name"]) {
        targetName = `${row["First Name"]} ${row["Last Name"] || ""}`.trim();
      } else if (row["Founder Name"]) {
        targetName = row["Founder Name"].trim();
      } else if (row["Name"]) {
        targetName = row["Name"].trim();
      }

      // Skip if no email
      if (!targetEmail) continue;

      process.stdout.write(
        `[${index + 1}/${allCandidates.length}] Checking: ${targetEmail}... `
      );

      // --- 🛑 DUPLICATE CHECK (Excel vs JSON History) ---
      const alreadySent = previouslySent.some((prev) => {
        // पुरानी हिस्ट्री में ईमेल चेक करें (चाहे वो DB ऑब्जेक्ट हो या डायरेक्ट)
        const prevEmail = prev.email || prev.leader?.email;
        return prevEmail === targetEmail;
      });

      if (alreadySent) {
        console.log(`⏭️  SKIPPED (Already Sent)`);
        skippedCount++;
        continue;
      }

      // --- 🚀 SEND EMAIL DIRECTLY (No DB Check) ---
      const isSent = await sendConfirmationEmail(targetEmail, targetName);

      if (isSent) {
        successList.push({
          name: targetName,
          email: targetEmail,
          phone: targetPhone,
          source: "Direct Excel Upload",
          email_status: "Sent",
          email_sent_at: new Date().toISOString(),
        });
        console.log(`✅ SENT to ${targetName}`);
      } else {
        failedList.push({ email: targetEmail, reason: "SMTP Error" });
        console.log(`❌ EMAIL FAILED`);
      }

      // ⏳ 2 सेकंड का ब्रेक
      await sleep(2000);
    }

    // --- Merge & Save Report ---
    const finalData = [...previouslySent, ...successList];
    fs.writeFileSync(OUTPUT_JSON, JSON.stringify(finalData, null, 2));

    console.log("\n================ REPORT ================");
    console.log(`⏭️  Skipped:         ${skippedCount}`);
    console.log(`✅ Newly Emailed:   ${successList.length}`);
    console.log(`❌ Failed:          ${failedList.length}`);
    console.log(`📄 Total Saved:     ${finalData.length}`);
    console.log("========================================");
  } catch (error) {
    console.error("\n❌ Critical Error:", error);
  }
};

startBulkProcess();
