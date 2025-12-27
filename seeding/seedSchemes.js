// require("dotenv").config();
const connectDB = require("../config/db");

const mongoose = require("mongoose");
const Scheme = require("../models/Scheme"); // Path apne according check karo
// const schemesData = require("../data/schemesData"); // Aapka data file

// const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/eim-db";


const schemesData = [
  {
    id: 1,
    name: "Startup India (DPIIT Recognition)",
    shortName: "DPIIT Recognition",
    category: "government-of-india",
    oneLiner: "DPIIT Recognition is the official recognition provided by the Department for Promotion of Industry and Internal Trade (DPIIT), Government of India, which certifies an entity as a “Startup” and unlocks tax exemptions, funding access, IPR benefits, and regulatory relaxations.",
    description: "Official DPIIT certification unlocking tax exemptions, IPR fast-tracking, funding eligibility, and easier compliance.",
    fullDescription: "Flagship recognition providing 100% tax exemption (3 years), angel tax relief, IPR rebates/fast-tracking, tender exemptions, and self-certification benefits.",
    detailedBenefits: [
      "Income Tax Exemption – Section 80-IAC: 100% income tax exemption for any 3 consecutive financial years within the first 10 years of incorporation",
      "Angel Tax Exemption (Section 56): Investments raised above Fair Market Value (FMV) are not taxed",
      "IPR Support: 80% rebate on patent filing fees, 50% rebate on trademark filing, Fast-track patent examination, Government-appointed IPR facilitators (free of cost)",
      "Tenders & PSU Opportunities: No prior experience, No turnover requirement, EMD exemption",
      "Easy compliance: Self-certification under labour & environment laws",
    ],
    detailedEligibility: [
      "Entity Type: Private Limited Company, LLP, or Registered Partnership Firm (Sole proprietorships/unregistered not eligible)",
      "Age: Less than 10 years from incorporation",
      "Turnover: Not exceeding ₹100 crore in any financial year",
      "Business Nature: Innovative, improving existing products/services, or scalable model with high employment/wealth potential",
      "Original Entity: Not formed by splitting/reconstructing existing business or rebranding",
    ],
    applicationProcess: [
      "Step 1: Register on Startup India Portal - https://www.startupindia.gov.in, Register/Login, Verify email/OTP",
      "Step 2: Login and complete profile",
      "Step 3: Create NSWS Account - https://www.nsws.gov.in, Register as Startup",
      "Step 4: Add “Registration as a Startup” approval",
      "Step 5: Fill entity details, startup profile (problem, solution, innovation/scalability), funding/awards",
      "Step 6: Upload documents: Certificate of Incorporation, PAN, Address proof, Innovation write-up, Optional pitch deck/website",
      "Step 7: Self-declaration and submit (No fees; Typically approved in 2 working days)",
    ],
    documentsRequired: [
      "Certificate of Incorporation",
      "PAN of entity",
      "Founder/Director details",
      "Business address proof",
      "Innovation & scalability write-up",
      "Website/app link (if any)",
    ],
    applyUrl: "https://www.startupindia.gov.in",
    processingTime: "2 working days (upon successful submission)",
    keyPoints: [
      "Over 1.74 lakh recognitions issued as of 2025",
      "Prerequisite for most other schemes",
      "Active and unchanged core criteria as of December 2025",
    ],
  },
  {
    id: 2,
    name: "Startup India Seed Fund Scheme (SISFS)",
    shortName: "SISFS",
    category: "government-of-india",
    oneLiner: "Startup India Seed Fund Scheme (SISFS) is a Government of India initiative to provide early-stage financial assistance to startups for idea validation, prototype development, product trials, market entry, and commercialization.",
    description: "Early-stage grant/debt via incubators for DPIIT-recognized startups.",
    fullDescription: "₹945 crore scheme (2021-2025) providing up to ₹20 lakh grant + ₹50 lakh debt/convertible; applications ongoing.",
    detailedBenefits: [
      "Grant up to ₹20 lakh for prototype/PoC/MVP/testing/validation/pilots",
      "Debt/convertible up to ₹50 lakh for market entry/commercialization/scaling",
      "Incubation, mentorship, investor/demo day exposure",
      "No government equity dilution",
      "Milestone-based disbursement",
      "Sector-agnostic",
    ],
    detailedEligibility: [
      "DPIIT-recognized",
      "Incorporated ≤2 years",
      "Indian origin with innovative/scalable model",
      "Prior government funding ≤₹10 lakh",
      "Clear milestones & fund use",
    ],
    applicationProcess: [
      "Step 1: Login to https://www.startupindia.gov.in/",
      "Step 2: Navigate to https://seedfund.startupindia.gov.in/, Apply Now",
      "Step 3: Select preferred incubators (up to multiple)",
      "Step 4: Upload pitch deck, business plan, fund utilization",
      "Step 5: Incubator evaluation (possible presentation/Q&A)",
      "Step 6: Approval & agreement",
      "Step 7: Milestone-based disbursement",
    ],
    documentsRequired: [
      "DPIIT Recognition Certificate",
      "Certificate of Incorporation",
      "Founder KYC (Aadhaar, PAN)",
      "Pitch Deck",
      "Detailed Business Plan",
      "Fund Utilization Plan",
      "Milestone roadmap",
      "Bank Details",
      "Incubator preference",
    ],
    applyUrl: "https://seedfund.startupindia.gov.in/",
    processingTime: "8-12 weeks",
    keyPoints: [
      "Ongoing applications (active as of December 2025)",
      "Supported thousands of startups via 300+ incubators",
    ],
  },
  {
    id: 3,
    name: "Fund of Funds for Startups (FFS – SIDBI)",
    shortName: "FFS – SIDBI",
    category: "government-of-india",
    oneLiner: "Fund of Funds for Startups (FFS) is a flagship Government of India initiative to provide equity funding support to startups indirectly through SEBI-registered AIFs.",
    description: "Indirect equity via government-supported AIFs/VCs.",
    fullDescription: "Corpus expanded to ₹20,000 crore (Budget 2025); supports AIFs investing in startups.",
    detailedBenefits: [
      "Access to large equity (₹1-25+ crore via VCs)",
      "No direct government equity/control",
      "Higher credibility & follow-on chances",
    ],
    detailedEligibility: [
      "DPIIT-recognized",
      "Scalable, innovation-driven, high-growth",
      "Typically seed to Series B",
      "Sector-agnostic",
    ],
    applicationProcess: [
      "Step 1: Ensure DPIIT recognition",
      "Step 2: Check SIDBI-backed AIFs at https://www.sidbivcf.in/en/funds/ffs",
      "Step 3: Pitch directly to relevant VCs/AIFs",
      "Step 4: VC due diligence & independent investment",
    ],
    documentsRequired: [
      "DPIIT Recognition Certificate",
      "Certificate of Incorporation",
      "Pitch Deck",
      "Financials/Projections",
      "Cap table",
      "Founder profiles",
      "Traction metrics",
    ],
    applyUrl: "https://www.sidbivcf.in/en/funds/ffs",
    processingTime: "3-6 months (VC-dependent)",
    keyPoints: [
      "Corpus ₹20,000 crore (additional ₹10,000 crore in Budget 2025)",
      "Supported 1,100+ startups as of 2025",
      "Active and expanded",
    ],
  },
  {
    id: 4,
    name: "Credit Guarantee Scheme for Startups (CGSS)",
    shortName: "CGSS",
    category: "government-of-india",
    oneLiner: "Credit Guarantee Scheme for Startups (CGSS) is a Government of India initiative to help startups raise bank loans without collateral with government guarantee.",
    description: "Collateral-free debt with guarantee cover up to ₹20 crore.",
    fullDescription: "Expanded in 2025: Guarantee up to ₹20 crore, higher cover %, reduced fees for champion sectors.",
    detailedBenefits: [
      "Collateral-free loans up to ₹20 crore",
      "Guarantee: 85% up to ₹10 crore, 75% above",
      "Easier approvals, retain ownership",
      "Working capital/term loans/venture debt",
    ],
    detailedEligibility: [
      "DPIIT-recognized",
      "Operational with viable model",
      "Not NPA",
      "Business purpose only",
    ],
    applicationProcess: [
      "Online: Jan Samarth Portal https://www.jansamarth.in/",
      "Offline: Approach Member Lending Institutions (banks/NBFCs/AIFs)",
    ],
    documentsRequired: [
      "DPIIT Recognition Certificate",
      "Certificate of Incorporation",
      "PAN & GST (if applicable)",
      "Founder KYC",
      "Loan application",
      "Business plan & revenue model",
      "Financial projections (2–3 years)",
      "Bank statements",
      "Existing loans (if any)",
    ],
    applyUrl: "https://www.jansamarth.in/",
    processingTime: "15-30 days",
    keyPoints: [
      "Expanded to ₹20 crore limit (May 2025 notification)",
      "Reduced AGF for champion sectors",
      "Active as of December 2025",
    ],
  },
  {
    id: 5,
    name: "Pradhan Mantri MUDRA Yojana (PMMY)",
    shortName: "PMMY",
    category: "government-of-india",
    oneLiner: "Pradhan Mantri MUDRA Yojana (PMMY) is a Government of India scheme that provides collateral-free loans to micro and small businesses.",
    description: "Collateral-free micro loans up to ₹20 lakh.",
    fullDescription: "Categories: Shishu (₹50k), Kishore (₹5L), Tarun (₹10L), Tarun Plus (₹20L for repeat borrowers).",
    detailedBenefits: [
      "Collateral-free up to ₹20 lakh",
      "Wide network (banks/NBFCs/MFIs)",
      "Flexible use: Working capital, equipment, expansion",
      "Low documentation",
    ],
    detailedEligibility: [
      "Indian citizen",
      "Non-farm micro/small enterprise",
      "New/existing (non-agricultural)",
    ],
    applicationProcess: [
      "Apply via https://www.mudra.org.in/ or banks/NBFCs",
      "Choose category (Shishu/Kishore/Tarun/Tarun Plus)",
      "Submit form & documents",
    ],
    documentsRequired: [
      "Aadhaar Card",
      "PAN Card",
      "Business address proof",
      "Bank account details",
      "Simple business plan/form",
      "Quotations (if applicable)",
      "Photographs",
    ],
    applyUrl: "https://www.mudra.org.in/",
    processingTime: "7-15 days",
    keyPoints: [
      "Tarun Plus category: Up to ₹20 lakh (introduced 2024, active 2025)",
      "Ideal for micro/early-stage",
    ],
  },
  {
    id: 6,
    name: "SAMRIDH Scheme (MeitY)",
    shortName: "SAMRIDH",
    category: "government-of-india",
    oneLiner: "SAMRIDH is a flagship startup acceleration scheme launched by the Ministry of Electronics and Information Technology (MeitY). The scheme supports software product startups through funding + structured acceleration via empanelled accelerators.",
    description: "Funding up to ₹40 lakh + acceleration for software product startups.",
    fullDescription: "Matching grant with accelerators; second cohort launched, ongoing calls.",
    detailedBenefits: [
      "Up to ₹40 lakh (50% MeitY + 50% accelerator)",
      "6-12 month structured program",
      "Mentoring (business/product/GTM/legal)",
      "Market access (enterprise/PSU pilots)",
      "Investor readiness & demo days",
    ],
    detailedEligibility: [
      "Indian software product company",
      "Working product, early traction/pilots",
      "DPIIT recognition preferred",
    ],
    applicationProcess: [
      "Check https://www.meity.gov.in/samridh for empanelled accelerators",
      "Search/apply for active accelerator cohorts",
      "Apply directly via accelerator website",
    ],
    documentsRequired: [
      "Certificate of Incorporation",
      "DPIIT Certificate (if available)",
      "Pitch Deck",
      "Product demo/access",
      "Business & revenue model",
      "Financial projections",
      "Founder profiles",
      "Bank details",
    ],
    applyUrl: "https://www.meity.gov.in/samridh",
    processingTime: "Accelerator-dependent (6-12 weeks)",
    keyPoints: [
      "Second cohort active (2024-2025)",
      "Apply through accelerators only",
    ],
  },
  {
    id: 7,
    name: "MSME Innovative / Incubation Scheme",
    shortName: "MSME Innovative",
    category: "government-of-india",
    oneLiner: "Grant support for MSMEs working on innovation and commercialization through incubation, design, and IPR.",
    description: "Integrated support for prototype, design, IPR commercialization.",
    fullDescription: "Unified scheme with grants up to ₹15 lakh incubation + design/IPR reimbursement.",
    detailedBenefits: [
      "Incubation grant up to ₹15 lakh",
      "Prototype & pilot funding",
      "IPR reimbursement",
      "Industry/market linkage via incubators",
    ],
    detailedEligibility: [
      "Udyam-registered MSME",
      "Innovative product/service",
      "Indian entity",
    ],
    applicationProcess: [
      "Visit https://innovative.msme.gov.in/",
      "Apply under relevant component (Incubation/Design/IPR)",
      "Select host institution/incubator",
      "Proposal evaluation & approval",
    ],
    documentsRequired: [
      "Udyam registration",
      "Project proposal",
      "Bank account details",
    ],
    applyUrl: "https://innovative.msme.gov.in/",
    processingTime: "6-8 weeks",
    keyPoints: [
      "Active integrated scheme as of 2025",
      "Focus on commercialization",
    ],
  },
  {
    id: 8,
    name: "Biotechnology Ignition Grant (BIG) – BIRAC, DBT",
    shortName: "BIG",
    category: "government-of-india",
    oneLiner: "Biotechnology Ignition Grant (BIG) is an early-stage grant funding scheme to support high-risk, high-potential biotech innovations.",
    description: "Up to ₹50 lakh grant for PoC/prototype in biotech.",
    fullDescription: "Non-repayable grant over 18 months with mentorship; biannual calls.",
    detailedBenefits: [
      "Grant up to ₹50 lakh for PoC/prototype/lab validation/early development",
      "Mentorship & networking via BIG partners",
      "Regulatory/commercialization guidance",
    ],
    detailedEligibility: [
      "Indian citizen/entity",
      "Early-stage (pre-revenue/early revenue)",
      "Novel biotech innovation with commercial potential",
      "DPIIT preferred for companies",
    ],
    applicationProcess: [
      "Check active calls on https://birac.nic.in/big.php (typically Jan/July)",
      "Register on BIRAC portal",
      "Fill online proposal (applicant/project/technical/team/budget details)",
      "Upload documents & submit",
      "Evaluation: Screening, expert review, presentation, selection",
    ],
    documentsRequired: [
      "Detailed Project Proposal",
      "Abstract & technical summary",
      "Work plan & milestones",
      "Budget utilization",
      "CVs of team",
      "Aadhaar/PAN",
      "Incorporation/DPIIT (if company)",
      "Incubator LOI (if needed)",
    ],
    applyUrl: "https://birac.nic.in/big.php",
    processingTime: "4-6 months post-call",
    keyPoints: [
      "25th call open until Nov 30, 2025",
      "Biannual calls active",
    ],
  },
  {
    id: 10,
    name: "GENESIS (Gen-Next Support for Innovative Startups) – MeitY / NSTEDB",
    shortName: "GENESIS",
    category: "government-of-india",
    oneLiner: "GENESIS is a national initiative to support early-stage to growth-stage tech startups through funding, incubation, mentoring, and ecosystem access.",
    description: "Umbrella support for tech startups, focus on Tier-II/III cities.",
    fullDescription: "₹490 crore scheme consolidating MeitY startup programs; funding varies by component.",
    detailedBenefits: [
      "Variable funding for early scaling/pilots",
      "Mentorship & ecosystem access",
      "Alignment with national digital priorities",
    ],
    detailedEligibility: [
      "Indian tech startup (digital/emerging tech)",
      "Incorporated (Pvt Ltd/LLP)",
      "DPIIT preferred",
      "Early traction/MVP/pilot-ready",
      "Sectors: AI/ML, SaaS, FinTech, HealthTech, etc.",
    ],
    applicationProcess: [
      "Apply through GENESIS-supported incubators/accelerators",
      "Check https://www.meity.gov.in/schemes/genesis for partners",
      "Submit via incubator program/call",
    ],
    documentsRequired: [
      "Certificate of Incorporation",
      "DPIIT Certificate (if available)",
      "Pitch Deck",
      "Founder profiles",
      "Product/demo link",
      "Business model & revenue plan",
      "Financial projections",
      "Bank details",
    ],
    applyUrl: "https://www.meity.gov.in/schemes/genesis",
    processingTime: "Incubator-dependent",
    keyPoints: [
      "Active with EiR & pilot components in 2025",
      "Focus on Tier-II/III",
    ],
  },
  // MP State Schemes (from previous accurate data)
  {
    id: 18,
    name: "MP Startup Policy (2025)",
    shortName: "MP Startup Policy",
    category: "state-government-madhya-pradesh",
    oneLiner: "MP Startup Policy (2025) is the flagship state policy to support startups through financial incentives, operational support, IP benefit, marketing assistance, tender preference, and ecosystem strengthening.",
    description: "State incentives for DPIIT-recognized startups operating in MP.",
    fullDescription: "Seed funding, sustenance allowance, IPR/marketing reimbursement, lease/utility subsidy, tender preference.",
    detailedBenefits: [
      "Seed funding up to ₹30 lakh",
      "Monthly sustenance allowance during incubation",
      "IPR cost reimbursement",
      "Marketing & branding support",
      "Utility/Lease subsidy",
      "Tender preference",
    ],
    detailedEligibility: [
      "DPIIT-recognized",
      "Incorporated as Pvt Ltd/LLP/Partnership",
      "Operating in Madhya Pradesh",
      "Innovative/scalable",
    ],
    applicationProcess: [
      "Visit https://startupmp.mygov.co.in/",
      "Register & complete profile",
      "Apply for specific incentives",
      "Upload required documents",
      "Track status on dashboard",
    ],
    documentsRequired: [
      "DPIIT certificate",
      "Incorporation certificate",
      "PAN/GST",
      "Pitch deck",
      "Bank details",
      "Incentive-specific docs",
    ],
    applyUrl: "https://startupmp.mygov.co.in/",
    processingTime: "4-8 weeks",
    keyPoints: [
      "Notified February 2025",
      "Single portal for all benefits",
      "Active as of December 2025",
    ],
  },
 
];

const seedSchemes = async () => {
  

  try {
    await connectDB();
    console.log("✅ MongoDB Connected Successfully");
    await Scheme.deleteMany({});
    console.log("🗑️ Existing schemes deleted");

    const inserted = await Scheme.insertMany(schemesData);
    console.log(`✅ ${inserted.length} schemes inserted successfully!`);

    await mongoose.connection.close();
    console.log("👋 Database connection closed");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error.message);
    process.exit(1);
  }
};

seedSchemes();
