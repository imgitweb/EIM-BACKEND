const router = require("express").Router();
const { CallOpenAi } = require("../../controller/helper/helper");
const MarketCalculation = require("../../models/marketsizecalculator/MarketSizeModel");
const Sales = require("../../models/SalseFunnel/SalesModel");

// POST: Calculate (AI) + Math + Save to DB
router.post("/calculate-and-save", async (req, res) => {
  try {
    const {
      startupId,
      productService,
      targetGeography,
      customerSegment,
      customerSegmentDetails,
      currency,
      averagePrice,
      samPercent,
      somPercent,
    } = req.body;

    // 1. OpenAI se Total Customers Estimate mangwana
    const prompt = `
      You are a senior market research analyst.
      Estimate the Total Addressable Market (Total Potential Customers) as a single integer number.
      Product: ${productService}
      Geography: ${targetGeography}
      Customer Segment: ${customerSegment}
      Segment Details: ${customerSegmentDetails || "General"}
      
      Reply with ONLY the number (e.g., 500000). No text, no explanations.
    `;

    // --- FIX IS HERE: Pass 'false' as second argument ---
    // Iska matlab hai hume JSON nahi, sirf number chahiye
    const aiResponse = await CallOpenAi(prompt, false);

    console.log("AI Raw Response:", aiResponse);

    // Remove text, keep only numbers
    const totalCustomers =
      parseInt(String(aiResponse).replace(/\D/g, ""), 10) || 0;

    if (totalCustomers === 0) {
      return res.status(400).json({
        message: "AI could not estimate customers. Please try again.",
      });
    }

    // 2. Math Calculations (TAM, SAM, SOM)
    const price = parseFloat(averagePrice) || 0;
    const tam = totalCustomers * price;
    const sam = tam * (parseFloat(samPercent) / 100);
    const som = sam * (parseFloat(somPercent) / 100);

    // 3. Database me Save karna
    const newRecord = new MarketCalculation({
      startupId,
      productService,
      targetGeography,
      customerSegment,
      customerSegmentDetails,
      currency,
      averagePrice: price,
      samPercent,
      somPercent,
      totalCustomers, // Parsed AI value
      tam,
      sam,
      som,
    });

    const savedData = await newRecord.save();

    // 4. Frontend ko response bhejna
    res.status(200).json(savedData);
  } catch (err) {
    console.error("Error in calculation:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

router.post("/update-reach", async (req, res) => {
  try {
    const { startupId, totalReach } = req.body;

    const existingRecord = await MarketCalculation.findOne({
      startupId: startupId,
    }).sort({
      createdAt: -1,
    });

    if (!existingRecord) {
      return res.status(404).json({
        message:
          "No market strategy found for this startup. Please run the calculator first.",
      });
    }

    // 2. AI Prompt
    const prompt = `
      You are a sales expert.
      Context: A startup selling "${existingRecord.productService}" to "${existingRecord.customerSegment}".
      Input Reach: ${totalReach} potential customers.
      
      Task: Estimate the sales funnel drop-off based on realistic industry conversion rates.
      Return ONLY a JSON object with integers:
      { "leads": 5000, "qualified": 1000, "deals": 200, "stays": 50 }
    `;

    // 3. AI Call
    const aiResponse = await CallOpenAi(prompt, true);
    console.log("AI Funnel Response:", aiResponse);

    // 4. Data Extraction
    const reachVal = parseInt(totalReach);
    const leadsVal = aiResponse.leads || Math.round(reachVal * 0.1);
    const qualifiedVal = aiResponse.qualified || Math.round(leadsVal * 0.25);
    const dealsVal = aiResponse.deals || Math.round(qualifiedVal * 0.2);
    const staysVal = aiResponse.stays || Math.round(dealsVal * 0.8);

    const getPercent = (part, total) => {
      if (!total || total === 0) return "0%";
      return ((part / total) * 100).toFixed(0) + "%";
    };

    // 5. Save to SALES Table (With Startup ID)
    const newSalesEntry = new Sales({
      startupId: startupId, // Link to startup
      marketCalculationId: existingRecord._id,
      reach: reachVal,
      leads: leadsVal,
      qualified: qualifiedVal,
      deals: dealsVal,
      stays: staysVal,
      leadsPercent: getPercent(leadsVal, reachVal),
      qualifiedPercent: getPercent(qualifiedVal, leadsVal),
      dealsPercent: getPercent(dealsVal, qualifiedVal),
      staysPercent: getPercent(staysVal, dealsVal),
    });

    const savedSales = await newSalesEntry.save();

    // 6. Recalculate Market Size Value (SOM)
    const somValue =
      reachVal *
      existingRecord.averagePrice *
      (existingRecord.somPercent / 100);

    // 7. Response
    res.json({
      message: "Sales Funnel Saved",
      data: savedSales,
      marketSizeValue: somValue,
      targetLocation: existingRecord.targetGeography,
    });
  } catch (err) {
    console.error("Funnel Update Error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/latest-sales-funnel/:startupId", async (req, res) => {
  try {
    const { startupId } = req.params;
    const data = await Sales.findOne({ startupId: startupId }).sort({
      createdAt: -1,
    });

    if (!data) return res.json(null); // Return null instead of 404 to avoid frontend crash
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: Latest Market Size BY STARTUP ID
router.get("/latest-market-size/:startupId", async (req, res) => {
  try {
    const { startupId } = req.params;
    const data = await MarketCalculation.findOne({ startupId: startupId }).sort(
      { createdAt: -1 }
    );

    if (!data)
      return res.json({ marketSizeValue: 0, targetLocation: "Global" });

    res.json({
      marketSizeValue: data.som,
      targetLocation: data.targetGeography,
      curruncy: data.currency,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
