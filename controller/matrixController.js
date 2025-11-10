const Mrr = require("../models/matrix/mrrModel");
const Gr = require("../models/matrix/grModel"); 
const Nr = require("../models/matrix/nrModel"); 
const Gp = require("../models/matrix/gpModel"); 
const Cb = require("../models/matrix/cbModel"); 
const Clv = require("../models/matrix/clvModel");
const Cr = require("../models/matrix/crModel"); 
const Cac = require("../models/matrix/CACModel"); 


// ===================================
// --- MRR Functions (No Change) ---
// ===================================

const createOrUpdateMrr = async (req, res) => {
    try {
        const { startup_id, year, month, no_customer, arpa } = req.body;
        const existingMrr = await Mrr.findOne({ startup_id, year, month });

        if (existingMrr) {
            existingMrr.no_customer = no_customer;
            existingMrr.arpa = arpa;
            await existingMrr.save();
            return res.status(200).json({ message: "MRR data updated successfully", data: existingMrr });
        } else {
            const newMrr = new Mrr({ startup_id, year, month, no_customer, arpa });
            await newMrr.save();
            return res.status(201).json({ message: "MRR data saved successfully", data: newMrr });
        }
    } catch (error) {
        console.error("Error saving or updating MRR data:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

const getMRR = async (req, res) => {
    try {
        const { startup_id } = req.params;
        const mrrData = await Mrr.find({ startup_id }).sort({ year: -1, month: -1 });

        if (!mrrData.length) {
            return res.status(404).json({ message: "No MRR data found for this startup ID" });
        }

        return res.status(200).json(mrrData);
    } catch (error) {
        console.error("Error fetching MRR data:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


// ==================================================
// --- Gross Revenue (GR) Functions (No Change) ---
// ==================================================

const createOrUpdateGr = async (req, res) => {
    try {
        const { startup_id, year, month, gross_revenue } = req.body; 
        const existingGr = await Gr.findOne({ startup_id, year, month });

        if (existingGr) {
            existingGr.gross_revenue = gross_revenue;
            await existingGr.save(); 
            return res.status(200).json({ message: "Gross Revenue data updated successfully", data: existingGr });
        } else {
            const newGr = new Gr({ startup_id, year, month, gross_revenue });
            await newGr.save();
            return res.status(201).json({ message: "Gross Revenue data saved successfully", data: newGr });
        }
    } catch (error) {
        console.error("Error saving or updating Gross Revenue data:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

const getGR = async (req, res) => {
    try {
        const { startup_id } = req.params;
        const grData = await Gr.find({ startup_id }).sort({ year: -1, month: -1 });

        if (!grData.length) {
            return res.status(404).json({ message: "No Gross Revenue data found for this startup ID" });
        }

        return res.status(200).json(grData);
    } catch (error) {
        console.error("Error fetching Gross Revenue data:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// ===================================
// 🔥 --- NEW: Net Revenue (NR) Functions --- 🔥
// ===================================

const createOrUpdateNr = async (req, res) => {
    try {
        const { startup_id, year, month, net_revenue } = req.body; 
        const existingNr = await Nr.findOne({ startup_id, year, month });

        if (existingNr) {
            existingNr.net_revenue = net_revenue;
            await existingNr.save(); 
            return res.status(200).json({ message: "Net Revenue data updated successfully", data: existingNr });
        } else {
            const newNr = new Nr({ startup_id, year, month, net_revenue });
            await newNr.save();
            return res.status(201).json({ message: "Net Revenue data saved successfully", data: newNr });
        }
    } catch (error) {
        console.error("Error saving or updating Net Revenue data:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

const getNR = async (req, res) => {
    try {
        const { startup_id } = req.params;
        const nrData = await Nr.find({ startup_id }).sort({ year: -1, month: -1 });

        if (!nrData.length) {
            return res.status(404).json({ message: "No Net Revenue data found for this startup ID" });
        }

        return res.status(200).json(nrData);
    } catch (error) {
        console.error("Error fetching Net Revenue data:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// ===================================
// 🔥 --- NEW: Gross Profit (GP) Functions --- 🔥
// ===================================

const createOrUpdateGp = async (req, res) => {
    try {
        const { startup_id, year, month, gross_profit } = req.body; 
        const existingGp = await Gp.findOne({ startup_id, year, month });

        if (existingGp) {
            existingGp.gross_profit = gross_profit;
            await existingGp.save(); 
            return res.status(200).json({ message: "Gross Profit data updated successfully", data: existingGp });
        } else {
            const newGp = new Gp({ startup_id, year, month, gross_profit });
            await newGp.save();
            return res.status(201).json({ message: "Gross Profit data saved successfully", data: newGp });
        }
    } catch (error) {
        console.error("Error saving or updating Gross Profit data:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

const getGP = async (req, res) => {
    try {
        const { startup_id } = req.params;
        const gpData = await Gp.find({ startup_id }).sort({ year: -1, month: -1 });

        if (!gpData.length) {
            return res.status(404).json({ message: "No Gross Profit data found for this startup ID" });
        }

        return res.status(200).json(gpData);
    } catch (error) {
        console.error("Error fetching Gross Profit data:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// ===================================
// 🔥 --- NEW: Customer Acquisition Cost (CAC) Functions --- 🔥
// ===================================

const createOrUpdateCac = async (req, res) => {
    console.log("--- REQUEST BODY RECEIVED ---", req.body); 
    try {
        // 1. Extract ALL raw data sent by the frontend
        const { 
            startup_id, 
            year, 
            month, 
            marketing_spend, 
            sales_spend,     
            new_customer     
        } = req.body;

        // --- CALCULATION LOGIC ---
        if (!marketing_spend || !sales_spend || !new_customer || parseInt(new_customer) <= 0) {
            return res.status(400).json({ message: "Missing required spending or customer data (New Customers must be > 0)." });
        }
        
        // Calculate CAC based on the formula
        const total_spend = parseFloat(marketing_spend) + parseFloat(sales_spend);
        const calculated_value = total_spend / parseInt(new_customer);
        // -------------------------

        // 2. DEFINE THE COMPLETE DATA PAYLOAD TO SATISFY THE SCHEMA
        const dataToSave = {
            year: parseInt(year),
            month: parseInt(month),
            // VITAL FIX: Include raw fields required by the Mongoose schema
            marketing_spend: parseFloat(marketing_spend), 
            sales_spend: parseFloat(sales_spend),
            new_customer: parseInt(new_customer),
            
            // VITAL FIX: Use the correct schema name for the calculated field (assuming 'calculated_cac')
            calculated_cac: calculated_value, 
            
            // NOTE: If your schema uses 'cac' instead of 'calculated_cac', 
            //       replace 'calculated_cac: calculated_value' with 'cac: calculated_value'
        };

        // 3. Check for existing entry using the unique index fields
        const existingCac = await Cac.findOne({ startup_id, year, month });

        if (existingCac) {
            // 4. Update existing entry with the full payload
            Object.assign(existingCac, dataToSave); 
            await existingCac.save(); 
            return res.status(200).json({ message: "CAC data updated successfully", data: existingCac });
        } else {
            // 5. Create new entry with the full payload
            const newCac = new Cac({ 
                startup_id, 
                ...dataToSave // Spreads all required fields and the calculated value
            });
            await newCac.save();
            return res.status(201).json({ message: "CAC data saved successfully", data: newCac });
        }
    } catch (error) {
        console.error("Error saving or updating CAC data:", error);
        // Better error response to help debug
        return res.status(500).json({ 
            message: "Internal server error. Check server logs for Mongoose validation failure.", 
            error: error.message 
        });
    }
};

// --- getCAC function remains correct and unchanged ---
const getCAC = async (req, res) => {
    try {
        const { startup_id } = req.params;
        const cacData = await Cac.find({ startup_id }).sort({ year: -1, month: -1 });

        if (!cacData.length) {
            return res.status(404).json({ message: "No CAC data found for this startup ID" });
        }
        
        return res.status(200).json(cacData);
    } catch (error) {
        console.error("Error fetching CAC data:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// ===================================
// 🔥 --- NEW: Cash Burn (CB) Functions --- 🔥
// ===================================

const createOrUpdateCb = async (req, res) => {
    try {
        const { startup_id, year, month, cash_burn } = req.body; 
        const existingCb = await Cb.findOne({ startup_id, year, month });

        if (existingCb) {
            existingCb.cash_burn = cash_burn;
            await existingCb.save(); 
            return res.status(200).json({ message: "Cash Burn data updated successfully", data: existingCb });
        } else {
            const newCb = new Cb({ startup_id, year, month, cash_burn });
            await newCb.save();
            return res.status(201).json({ message: "Cash Burn data saved successfully", data: newCb });
        }
    } catch (error) {
        console.error("Error saving or updating Cash Burn data:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

const getCB = async (req, res) => {
    try {
        const { startup_id } = req.params;
        const cbData = await Cb.find({ startup_id }).sort({ year: -1, month: -1 });

        if (!cbData.length) {
            return res.status(404).json({ message: "No Cash Burn data found for this startup ID" });
        }

        return res.status(200).json(cbData);
    } catch (error) {
        console.error("Error fetching Cash Burn data:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// ===================================
// 🔥 --- NEW: Customer Lifetime Value (CLV) Functions --- 🔥
// ===================================

const createOrUpdateClv = async (req, res) => {
    try {
        const { startup_id, year, month, clv } = req.body; 
        const existingClv = await Clv.findOne({ startup_id, year, month });

        if (existingClv) {
            existingClv.clv = clv;
            await existingClv.save(); 
            return res.status(200).json({ message: "CLV data updated successfully", data: existingClv });
        } else {
            const newClv = new Clv({ startup_id, year, month, clv });
            await newClv.save();
            return res.status(201).json({ message: "CLV data saved successfully", data: newClv });
        }
    } catch (error) {
        console.error("Error saving or updating CLV data:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

const getCLV = async (req, res) => {
    try {
        const { startup_id } = req.params;
        const clvData = await Clv.find({ startup_id }).sort({ year: -1, month: -1 });

        if (!clvData.length) {
            return res.status(404).json({ message: "No CLV data found for this startup ID" });
        }

        return res.status(200).json(clvData);
    } catch (error) {
        console.error("Error fetching CLV data:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// ===================================
// 🔥 --- NEW: Churn Rate (CR) Functions --- 🔥
// ===================================

const createOrUpdateCr = async (req, res) => {
    try {
        const { startup_id, year, month, churn_rate } = req.body; 
        const existingCr = await Cr.findOne({ startup_id, year, month });

        if (existingCr) {
            existingCr.churn_rate = churn_rate;
            await existingCr.save(); 
            return res.status(200).json({ message: "Churn Rate data updated successfully", data: existingCr });
        } else {
            const newCr = new Cr({ startup_id, year, month, churn_rate });
            await newCr.save();
            return res.status(201).json({ message: "Churn Rate data saved successfully", data: newCr });
        }
    } catch (error) {
        console.error("Error saving or updating Churn Rate data:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

const getCR = async (req, res) => {
    try {
        const { startup_id } = req.params;
        const crData = await Cr.find({ startup_id }).sort({ year: -1, month: -1 });

        if (!crData.length) {
            return res.status(404).json({ message: "No Churn Rate data found for this startup ID" });
        }

        return res.status(200).json(crData);
    } catch (error) {
        console.error("Error fetching Churn Rate data:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// ===================================
// --- Module Exports (Updated) ---
// ===================================

module.exports = {
    createOrUpdateMrr,
    getMRR,

    createOrUpdateGr, 
    getGR,
   
    createOrUpdateNr,
    getNR,

    createOrUpdateGp,
    getGP,

    createOrUpdateCac,
    getCAC,

    createOrUpdateCb,
    getCB,

    createOrUpdateClv,
    getCLV,

    createOrUpdateCr,
    getCR,
};