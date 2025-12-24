require("dotenv").config();
const mongoose = require("mongoose");
const Scheme = require("../models/Scheme");

const MONGO_URI = process.env.MONGO_URI;
const schemesData = [
  {
    id: 1,
    name: "Startup India (DPIIT Recognition)",
    shortName: "DPIIT Recognition",
    category: "government-of-india",
    oneLiner:
      "DPIIT Recognition is the official recognition provided by the Department for Promotion of Industry and Internal Trade (DPIIT), Government of India, which certifies an entity as a “Startup” and unlocks tax exemptions, funding access, IPR benefits, and regulatory relaxations.",
    description:
      "Official Government of India recognition that unlocks tax, funding, and regulatory benefits for startups.",
    fullDescription:
      "Official Government of India recognition that unlocks tax, funding, and regulatory benefits for startups. This is the flagship recognition program that provides income tax exemption, angel tax exemption, IPR support, and government tender access.",
    detailedBenefits: [
      "Income Tax Exemption – Section 80-IAC: 100% income tax exemption for any 3 consecutive financial years within the first 10 years of incorporation",
      "Angel Tax Exemption (Section 56): Investments raised above Fair Market Value (FMV) are not taxed",
      "IPR Support: 80% rebate on patent filing fees, 50% rebate on trademark filing, Fast-track patent examination, Government-appointed IPR facilitators available (free of cost)",
      "Tenders & PSU Opportunities: No prior experience, No turnover requirement",
      "Easy compliance: Self-certification under labour & environment laws",
    ],
    detailedEligibility: [
      "Type of Entity: Must be incorporated as Private Limited Company, Limited Liability Partnership (LLP), or Registered Partnership Firm (Sole proprietorships and unregistered entities are not eligible)",
      "Age of the Startup: Less than 10 years old (from date of incorporation, not idea date)",
      "Annual Turnover Limit: Should not exceed ₹100 crore in any financial year since incorporation",
      "Nature of Business: Working towards innovation, OR Improvement of existing products/services, OR Having a scalable business model with high employment potential OR Wealth creation potential (Businesses formed by splitting or reconstructing an existing business are not eligible; Pure trading businesses with no innovation angle may get rejected)",
      "Original Entity: The startup should not be formed by merger of existing businesses or rebranding of an old company",
    ],
    applicationProcess: [
      "Step 1: Register on Startup India Portal - Go to https://www.startupindia.gov.in, Click Register / Login, Enter email, mobile number and create a password, Verify email/OTP",
      "Step 2: Login to Startup India Portal - Login to dashboard, Complete profile with incorporation details, PAN, Business description, Address, sector etc. (Redirected to NSWS for DPIIT recognition)",
      "Step 3: Create an NSWS Account - Visit https://www.nsws.gov.in, Click Register (Investor/Startup user account), Verify email and mobile using OTP",
      "Step 4: Add the Startup Recognition Application - On NSWS dashboard, Click “Add Approvals.” → “Central Approvals.” → Search for “Registration as a Startup.” → Add to dashboard",
      "Step 5: Fill the DPIIT Startup Recognition Form - Provide Entity Details (Startup name, Incorporation/Registration number, Date of incorporation, PAN, Registered address), Startup Profile (Problem solved, Solution with innovation/scalability, Market sector), Funding / Awards / Achievements",
      "Step 6: Upload Supporting Documents - Certificate of Incorporation, PAN, Founders’ details, Business address proof, Innovation / description write-up file, Optional pitch deck/ website URLs (Formats: PDF, PNG, JPG; Max 5MB per document)",
      "Step 7: Self-Declaration and Submit - Check self-declaration box, Click “Submit.” (Application forwarded to DPIIT for review; No fees charged)",
    ],
    documentsRequired: [
      "Certificate of Incorporation",
      "PAN of entity",
      "Founder/Director details",
      "Innovation & scalability write-up",
      "Website/app link (if any)",
      "Business address proof",
    ],
    applyUrl: "https://www.startupindia.gov.in",
    processingTime: "4-6 weeks",
    keyPoints: [
      "No application fee",
      "Most important prerequisite for other schemes",
      "NSWS registration is mandatory even if you have Startup India login",
      "Recognition valid for entire startup period",
    ],
  },
  {
    id: 2,
    name: "Startup India Seed Fund Scheme (SISFS)",
    shortName: "SISFS",
    category: "government-of-india",
    oneLiner:
      "Startup India Seed Fund Scheme (SISFS) is a Government of India initiative to provide early-stage financial assistance to startups for idea validation, prototype development, product trials, market entry, and commercialization.",
    description:
      "Government seed funding for early-stage startups via approved incubators.",
    fullDescription:
      "Government seed funding for early-stage startups via approved incubators. Provides prototype/PoC grants up to ₹20 lakh and market entry support up to ₹50 lakh through convertible debentures without equity dilution.",
    detailedBenefits: [
      "Grant for Prototype / PoC / MVP: Up to ₹20 lakh (Used for prototype development, Proof of Concept (PoC), Product testing, Market validation, Pilot projects)",
      "Debt / Convertible Instrument Support: Up to ₹50 lakh per startup (Given as convertible debentures, convertible notes, debt-linked instruments; Used for market entry, commercialization, scaling operations, customer acquisition)",
      "Non-Financial Support: Incubation support, Mentorship & expert guidance, Business strategy & compliance help, Investor readiness & demo day exposure",
      "Founder-Friendly Structure: No direct equity taken by Government, Funds released milestone-wise, Sector-agnostic (tech & non-tech both allowed)",
    ],
    detailedEligibility: [
      "Must be DPIIT-recognized startup",
      "Incorporated not more than 2 years ago at the time of application",
      "Must be Indian origin startup",
      "Must be working on innovation, OR New product/service, OR Scalable business model",
      "Startup should not have received more than ₹10 lakh from any other Government scheme",
      "Must show clear use of funds and milestones",
    ],
    applicationProcess: [
      "Step 1: Startup India Portal Registration - Go to https://www.startupindia.gov.in/, Login using startup credentials, Ensure DPIIT Recognition is approved",
      "Step 2: Apply Under Seed Fund Scheme - From dashboard, navigate to Funding Schemes → Startup India Seed Fund Scheme, https://seedfund.startupindia.gov.in/, Click on Apply Now",
      "Step 3: Select Preferred Incubator - Choose incubators listed on the portal (Can select multiple; Choose based on sector alignment)",
      "Step 4: Submit Application & Documents - Upload pitch deck, business plan, fund utilization breakup, Submit application",
      "Step 5: Incubator Screening Committee (ISC) Evaluation - Evaluation based on innovation & uniqueness, market potential, team capability, financial planning (May include presentation, Q&A round)",
      "Step 6: Approval & Fund Sanction - If selected, receive official approval, Funding type (Grant or Debt) finalized, Agreement signed between startup & incubator",
      "Step 7: Milestone-Based Fund Disbursement - Funds released in tranches, Each tranche linked to pre-defined milestones, Progress review by incubator",
    ],
    documentsRequired: [
      "DPIIT Recognition Certificate",
      "Certificate of Incorporation (Pvt Ltd / LLP / Partnership)",
      "Founder KYC (Aadhaar, PAN)",
      "Pitch Deck (problem, solution, market, traction)",
      "Detailed Business Plan",
      "Fund Utilization Plan (how seed fund will be used)",
      "Milestone roadmap (3–6–12 months)",
      "Startup Bank Account Details",
      "Incubator preference (if multiple options available)",
    ],
    applyUrl: "https://seedfund.startupindia.gov.in/",
    processingTime: "8-12 weeks",
    keyPoints: [
      "Milestone-based fund release reduces risk",
      "No equity dilution",
      "Mentorship from experienced partners",
      "Can combine with other government benefits",
    ],
  },
  {
    id: 3,
    name: "Fund of Funds for Startups (FFS – SIDBI)",
    shortName: "FFS – SIDBI",
    category: "government-of-india",
    oneLiner:
      "Fund of Funds for Startups (FFS) is a flagship Government of India initiative to provide equity funding support to startups indirectly. The Government does NOT invest directly in startups. Instead, it invests in SEBI-registered Alternative Investment Funds (AIFs), which then invest in startups.",
    description:
      "Government capital deployed into startups indirectly through VC funds.",
    fullDescription:
      "Government capital deployed into startups indirectly through VC funds. Enables large equity funding (₹1 Cr+) without direct government equity dilution and increases investor confidence. FFS is NOT a grant or loan — it is pure equity investment routed through VCs.",
    detailedBenefits: [
      "Access to large equity funding: Typically ₹1 Cr to ₹25+ Cr, depending on stage and VC",
      "No direct government equity or control",
      "Higher credibility with investors & institutions",
      "Better chances of: Follow-on rounds, Strategic partnerships, Faster scaling",
    ],
    detailedEligibility: [
      "Must be a DPIIT-recognized startup",
      "Incorporated in India (Pvt Ltd / LLP preferred)",
      "Should be: Scalable, Innovation-driven, High growth potential",
      "Generally suitable for: Seed to Series B stage startups",
      "Sector-agnostic",
      "Strong founding team",
      "Clear product-market fit or strong traction",
      "Large addressable market",
      "Revenue visibility or growth metrics",
      "Clean cap table & compliance readiness",
    ],
    applicationProcess: [
      "Step 1: Ensure DPIIT Recognition - Startup must be DPIIT-recognized on Startup India portal https://www.startupindia.gov.in/",
      "Step 2: Identify SIDBI-Backed VC Funds - Visit SIDBI website https://www.sidbivcf.in/en/funds/ffs, Click on Apply Now: https://vcfapplication.sidbi.in/login, Check List of empaneled AIFs under FFS",
      "Step 3: Shortlist Relevant VC Funds - Select funds based on sector focus, stage preference, ticket size, Prepare a custom pitch for each fund",
      "Step 4: Pitch to the VC / AIF - Reach out via VC websites, warm introductions, incubators / accelerators, Submit pitch deck, executive summary",
      "Step 5: VC Due Diligence - If VC is interested: Business due diligence, Financial & legal checks, Founder discussions, VC decides independently whether to invest",
      "Step 6: Investment by VC (SIDBI Role is Indirect) - VC uses its fund corpus (partly supported by SIDBI), Startup receives equity investment, SIDBI does not interact directly with startup",
    ],
    documentsRequired: [
      "DPIIT Recognition Certificate",
      "Certificate of Incorporation",
      "Pitch Deck",
      "Financial statements / projections",
      "Cap table",
      "Founder profiles",
      "Product demo / MVP details",
      "Traction metrics",
    ],
    applyUrl: "https://www.sidbivcf.in/en/funds/ffs",
    processingTime: "3-6 months (VC dependent)",
    keyPoints: [
      "VC makes independent investment decision",
      "Government invests in VCs, not directly in startups",
      "Founder equity ownership protected",
      "Access to VC networks and expertise",
    ],
  },
  {
    id: 4,
    name: "Credit Guarantee Scheme for Startups (CGSS)",
    shortName: "CGSS",
    category: "government-of-india",
    oneLiner:
      "Credit Guarantee Scheme for Startups (CGSS) is a Government of India initiative to help startups raise bank loans without collateral. Under this scheme, the Government provides a credit guarantee to banks and NBFCs, reducing their risk.",
    description:
      "Government guarantee enabling collateral-free loans for startups.",
    fullDescription:
      "Government guarantee enabling collateral-free loans for startups. Reduces risk for banks and enables faster loan approvals with easier access to working capital and term loans.",
    detailedBenefits: [
      "Collateral-free loans: No need to pledge property, machinery, or personal assets",
      "Easier loan approvals: Bank risk is partially covered by Government guarantee",
      "Lower dependence on equity funding: Founders retain ownership",
      "Supports both working capital & term loans",
      "Applicable across sectors (tech & non-tech)",
    ],
    detailedEligibility: [
      "Must be a DPIIT-recognized startup",
      "Incorporated in India (Pvt Ltd / LLP / Partnership)",
      "Startup should: Be operational, Have a viable business model",
      "Loan should be used only for business purposes",
      "Startup should not be classified as Non-Performing Asset",
    ],
    applicationProcess: [
      "ONLINE Application: Visit the Jan Samarth Portal https://www.jansamarth.in/ and complete the online application (Refer to instructional video: https://www.youtube.com/watch?v=m7zl1dT2Tis&t=6s)",
      "Offline Application: Approach the nearest branch of any Member Lending Institution (MLI) directly and enquire about the required process (List of eligible MLIs available on portal)",
    ],
    documentsRequired: [
      "DPIIT Recognition Certificate",
      "Certificate of Incorporation",
      "PAN & GST (if applicable)",
      "Founder KYC (Aadhaar, PAN)",
      "Detailed loan application",
      "Business plan & revenue model",
      "Financial projections (2–3 years)",
      "Bank statements",
      "Existing loan details (if any)",
    ],
    applyUrl: "https://www.jansamarth.in/",
    processingTime: "15-30 days",
    keyPoints: [
      "No collateral requirement",
      "Government guarantee covers bank risk",
      "Faster than traditional loans",
      "Works for working capital and term loans",
    ],
  },
  {
    id: 5,
    name: "Pradhan Mantri MUDRA Yojana (PMMY)",
    shortName: "PMMY",
    category: "government-of-india",
    oneLiner:
      "Pradhan Mantri MUDRA Yojana (PMMY) is a Government of India scheme that provides collateral-free loans to micro and small businesses.",
    description: "Collateral-free loans for micro and early-stage businesses.",
    fullDescription:
      "Collateral-free loans for micro and early-stage businesses. Offers loans from ₹50,000 to ₹20 lakh with low documentation requirements suitable for very early-stage startups.",
    detailedBenefits: [
      "Collateral-free loans upto 20 Lakh: No property, asset, or third-party guarantee required",
      "Wide lender network: Public/private banks, NBFCs, MFIs",
      "Flexible end-use: Working capital, Equipment purchase, Business expansion",
      "Lower documentation: Compared to traditional business loans",
      "Suitable for first-time entrepreneurs",
      "No processing fee (as per lender norms)",
    ],
    detailedEligibility: [
      "Indian citizen",
      "Individual entrepreneur or micro business owner",
      "New or existing business (non-farm)",
      "Proprietorship / Partnership / Small firm / Micro enterprise",
      "Business Eligibility: Non-agricultural income-generating activities, including Manufacturing, Trading, Services; Small shops, vendors, startups at micro level, home-based businesses",
      "PMMY is ideal for very early-stage or micro startups, not VC-scale ventures",
    ],
    applicationProcess: [
      "Option 1: Apply Online via PMMY Portal - Go to https://www.mudra.org.in/, Click on “Apply for Mudra Loan”, Choose loan type: Shishu (up to ₹50k), Kishore (₹50k–₹5L), Tarun (₹5L–₹10L), Tarun plus (₹10L–₹20L), Download and fill the loan application form, Submit the filled form to a bank/NBFC of your choice, Bank contacts you for verification and appraisal, On approval, loan is sanctioned and disbursed",
    ],
    documentsRequired: [
      "Aadhaar Card",
      "PAN Card",
      "Business address proof",
      "Bank account details",
      "Simple business plan or loan application form",
      "Quotations for equipment (if applicable)",
      "Recent photographs",
      "Note: Exact documents may vary slightly by bank/NBFC",
    ],
    applyUrl: "https://www.mudra.org.in/",
    processingTime: "7-15 days",
    keyPoints: [
      "Best for micro-level businesses",
      "No collateral",
      "Quick approval",
      "Minimal documentation",
      "Government-backed guarantee",
    ],
  },
  {
    id: 6,
    name: "SAMRIDH Scheme (MeitY)",
    shortName: "SAMRIDH",
    category: "government-of-india",
    oneLiner:
      "SAMRIDH is a flagship startup acceleration scheme launched by the Ministry of Electronics and Information Technology (MeitY). The scheme supports software product startups through funding + structured acceleration. SAMRIDH is implemented via MeitY-empanelled accelerators, not directly by the government.",
    description:
      "Acceleration and funding support for software product startups.",
    fullDescription:
      "Acceleration and funding support for software product startups under MeitY. Provides funding up to ₹40 lakh with 50% government support, market access, and accelerator mentorship.",
    detailedBenefits: [
      "Financial Support: Up to ₹40 lakh per startup (50% funded by MeitY + 50% by Accelerator; Usage: product improvement, customer acquisition, marketing & sales, tech/cloud costs, team hiring)",
      "Structured Acceleration: 6–12 month accelerator-led program, Mentoring on business, product, GTM, legal, and compliance, Investor readiness support",
      "Market Access: Connects startups to enterprise customers, government/PSUs, and strategic partners, Support for pilots, PoVs, and B2B onboarding",
      "Investment Readiness: Pitch refinement & demo days, Exposure to VCs, angels, and corporates, Added credibility through MeitY backing",
    ],
    detailedEligibility: [
      "Must be an Indian startup",
      "Should be a software product company",
      "Incorporated as: Private Limited Company / LLP",
      "DPIIT recognition is highly preferred",
      "Startup should have: Working product, Early traction or pilot customers, Clear revenue or monetization plan",
    ],
    applicationProcess: [
      "STEP 1: Open Official SAMRIDH Scheme - Go to https://www.meity.gov.in/samridh (For information, objectives, list of empanelled accelerators, press releases & cohort announcements; Not for direct application)",
      "STEP 2: Identify ACTIVE SAMRIDH Accelerators - On SAMRIDH page, note accelerator names OR Search “SAMRIDH Accelerator Cohort Apply” OR Follow MeitY / Startup India announcements",
      "STEP 3: Open Accelerator Website (This Is Where You Apply) - Visit shortlisted accelerator’s website & Apply",
      "Note: Startups do NOT apply directly to MeitY; Applications opened by individual accelerators",
    ],
    documentsRequired: [
      "Certificate of Incorporation",
      "DPIIT Recognition Certificate (if available)",
      "Pitch Deck",
      "Product demo or access",
      "Business & revenue model",
      "Financial projections",
      "Founder profiles",
      "Bank account details",
      "Accelerator application form (specific to each cohort)",
    ],
    applyUrl: "https://www.meity.gov.in/samridh",
    processingTime: "6-12 weeks (accelerator dependent)",
    keyPoints: [
      "Apply through empanelled accelerators only",
      "For software product startups",
      "Each accelerator launches own call",
      "Structured acceleration + funding",
      "MeitY backing adds credibility",
    ],
  },
  {
    id: 7,
    name: "MSME Innovative / Incubation Scheme",
    shortName: "MSME Innovation",
    category: "government-of-india",
    oneLiner:
      "Grant support for MSMEs working on innovation and commercialization.",
    description:
      "Grant support for MSMEs working on innovation and commercialization.",
    fullDescription:
      "Grant support for MSMEs working on innovation and commercialization through approved incubators. Provides grants up to ₹15 lakh for prototype and pilot funding.",
    detailedBenefits: [
      "Grant up to ₹15 lakh",
      "Prototype & pilot funding",
      "Industry & market linkage",
      "Support through approved incubators",
    ],
    detailedEligibility: [
      "Udyam-registered MSME",
      "Innovative product/service",
      "Indian entity",
    ],
    applicationProcess: [
      "1. Visit: https://www.msme.gov.in",
      "2. Apply under MSME Innovative Scheme",
      "3. Select incubator / host institution",
      "4. Proposal evaluation",
      "5. Grant approval & release",
    ],
    documentsRequired: [
      "Udyam registration",
      "Project proposal",
      "Bank account details",
    ],
    applyUrl: "https://www.msme.gov.in",
    processingTime: "6-8 weeks",
    keyPoints: [
      "Only for Udyam-registered MSMEs",
      "Grant-based (no repayment)",
      "Incubator support included",
    ],
  },
  {
    id: 8,
    name: "Biotechnology Ignition Grant (BIG) – BIRAC, DBT",
    shortName: "BIG",
    category: "government-of-india",
    oneLiner:
      "Biotechnology Ignition Grant (BIG) is an early-stage grant funding scheme to support high-risk, high-potential biotech innovations. Implemented by BIRAC, under the Department of Biotechnology (DBT).",
    description:
      "Grant support of up to ₹50 lakh to biotech/healthcare/biomedical startups for proof-of-concept and early development.",
    fullDescription:
      "Grant support from BIRAC, DBT of up to ₹50 lakh to biotech/healthcare/biomedical startups for proof-of-concept and early development over 18 months with mentorship support.",
    detailedBenefits: [
      "Grant Support: Grant up to ₹50 lakh, Non-equity, non-repayable (pure grant), Grant tenure: up to 18 months, Funds can be used for: Proof of Concept (PoC), Prototype development, Lab validation & testing, Early product development, Regulatory groundwork (pre-clinical, feasibility)",
      "Mentorship & Ecosystem Support: Assigned BIG Partner / Incubator, Technical & business mentoring, Regulatory & commercialization guidance, Industry and investor exposure, Mentorship, networking, and commercialization support via BIG partners nationwide, Focused on biotechnology, diagnostics, medical devices, bio-materials, etc.",
    ],
    detailedEligibility: [
      "Applicant must be Indian citizen / Indian entity",
      "If company: Incorporated in India (Pvt Ltd / LLP), Preferably DPIIT-recognized startup",
      "Startup should be early-stage (pre-revenue or early revenue)",
      "Idea must be technology-driven and innovative",
      "Project Eligibility: Innovation should be novel, Have commercial potential, Involve biotech / life science intervention, Should not have received large prior government grants for the same idea",
    ],
    applicationProcess: [
      "STEP 1 — Visit the Official BIG Scheme Page: https://birac.nic.in/big.php (BIRAC) (Overview, Latest Call for Proposals, Links for guidelines, application formats, registration)",
      "STEP 2 — Check Active BIG Call: On BIG page, scroll to “Call for Proposal” section https://birac.nic.in/cfp.php, Look for call such as “25th Call for Proposals under BIG” with dates and Last Date to Apply (Only during call period)",
      "STEP 3 — Click to Register for BIG Scheme: On BIG page, find “Click here to register for BIG Scheme” https://birac.nic.in/desc_new.php?id=327, Opens BIRAC user registration https://birac.nic.in/birac_registration.php?scheme_type=5",
      "STEP 4 — Complete User Registration: Fill Name, Email, Mobile, Organization / Institution (optional), Create username & password, Get confirmation email",
      "STEP 5 — Login to BIG Portal: Enter username & password on BIRAC login page, Opens dashboard with Create Proposal, Track Submission, Download Forms",
      "STEP 6 — Start a New BIG Application: Click “Create Proposal” or “Apply for BIG Scheme”, Guided to BIG application form",
      "STEP 7 — Fill Online Application Form: Applicant Details (Individual/Company), Project / Innovation Details (Title, Problem, Solution, Stage), Technical Details (Technology, Methodology, Deliverables), Team & Expertise (Details, Background, Roles), Budget & Milestones (Estimated budget, Breakup, Timelines), Incubator / Facility Details (If no lab, Indicate incubator, Upload LOI)",
      "STEP 8 — Upload Documents: Detailed project proposal (PDF), CVs of team members, Company incorporation or individual ID proofs (Aadhaar, PAN), Proof of facility / incubator association, Budget sheet",
      "STEP 9 — Final Review & Submit: Preview, Click “Submit”, Get acknowledgment receipt/email",
      "STEP 10 — Post-Submission Evaluation: Initial screening, Expert reviews, TEP presentations, ESC recommendation, Due diligence & agreement, Grant release milestone-wise over ~18 months",
      "Application guide Doc: https://birac.nic.in/webcontent/1547451412_big_registration_guidelines_14_01_2019.pdf",
      "KEY POINTS: Apply only within active call period (e.g., Jan & July), Registration required before call closes, Online only via BIRAC portal, Include lab/incubator support details if individual",
    ],
    documentsRequired: [
      "Detailed Project Proposal (BIG format)",
      "Abstract & technical summary",
      "Work plan with milestones",
      "Budget & fund utilization plan",
      "CVs of founders / investigators",
      "Aadhaar & PAN (individual/company)",
      "Certificate of Incorporation (if startup / company)",
      "DPIIT Recognition (if available)",
      "Shareholding pattern (if company)",
      "Bank account details",
      "If Individual Innovator: Proof of association with lab/incubator (preferred), Host Institute consent (if lab access required)",
    ],
    applyUrl: "https://birac.nic.in/big.php",
    processingTime: "4-6 months (after call closes)",
    keyPoints: [
      "Apply ONLY during active call period",
      "Registration required before call closes",
      "Online application only",
      "For biotech/healthcare/biomedical startups",
      "Grant released milestone-wise",
      "Non-repayable grant",
      "Guide: https://birac.nic.in/webcontent/1547451412_big_registration_guidelines_14_01_2019.pdf",
    ],
  },
  {
    id: 10,
    name: "GENESIS (Gen-Next Support for Innovative Startups) – MeitY / NSTEDB",
    shortName: "GENESIS",
    category: "government-of-india",
    oneLiner:
      "GENESIS is a national initiative to support early-stage to growth-stage tech startups through funding, incubation, mentoring, and ecosystem access. The scheme is implemented by the Ministry of Electronics and Information Technology (MeitY) in collaboration with NSTEDB.",
    description:
      "Support and scaling programme under MeitY for tech startups, focused on growth, market penetration and sustained operation.",
    fullDescription:
      "Support and scaling programme under MeitY / NSTEDB for tech startups, focused on growth, market penetration and sustained operation with funding for early commercial scaling. Brochure link by Meity: https://msh.meity.gov.in/assets/Brochure_GENESIS.pdf",
    detailedBenefits: [
      "Funding support for early commercial scaling (quantum varies by call)",
      "Mentorship & ecosystem access through government partners",
      "Encourages digital and deep tech innovation alignment with national priorities",
    ],
    detailedEligibility: [
      "Indian tech startup focused on digital or emerging technologies",
      "Indian startup incorporated in India (Pvt Ltd / LLP)",
      "Preferably DPIIT-recognized",
      "Technology-driven or innovation-led startup",
      "Early traction / MVP / pilot-ready startups preferred",
      "Sector focus (varies by incubator), typically: AI / ML, SaaS, FinTech, HealthTech, EdTech, DeepTech, Electronics / IT / Digital products",
    ],
    applicationProcess: [
      "Startups do NOT apply directly to MeitY or NSTEDB; Startups apply through GENESIS-supported incubators / accelerators",
      "👉 Visit the official GENESIS page on MeitY portal: https://www.meity.gov.in/schemes/genesis (Overview, Objectives & implementation model, References to GENESIS hubs / incubators, Government notifications & updates; Informational, not direct application)",
      "STEP 2: Identify Active GENESIS Incubators / Accelerators - GENESIS works through selected incubators & ecosystem partners, List of implementing agencies https://msh.meity.gov.in/assets/genesisia%20.pdf, Check announcements on MeitY website, Startup India updates, Incubator websites, Search “GENESIS startup program apply” or “GENESIS MeitY incubator cohort”, Each incubator launches its own application call",
      "STEP 3: Open Incubator Website (This Is Where You Apply) - Visit incubator’s official website, Go to Programs / GENESIS / Startup Support, Click Apply Now / Apply for GENESIS Program / Startup Application (Opens actual online application form)",
      "STEP 4: Click “Apply Now” → Online Form Opens - Startup Details (Name, Incorporation date, Entity type, DPIIT number), Founder Details (Names & roles, Contact details, Full-time commitment), Product & Innovation (Problem statement, Product/solution, Technology stack, Stage), Market & Business (Target customers, Revenue model, Traction), Funding & Growth (Current funding status, How GENESIS support will be used, Expected outcomes), Uploads (Pitch deck PDF, Demo link, Company documents)",
      "STEP 5: Submit Application (Online) - Click Submit, Receive on-screen/email confirmation",
      "STEP 6: Screening & Shortlisting - Incubator evaluates on innovation, market readiness, team strength, scalability, Shortlisted invited for pitch presentation, product demo, interaction round",
      "STEP 7: Selection & Onboarding - If selected: Receive selection email, program details, funding/benefit structure, Sign legal agreements with incubator, Onboarded under GENESIS program",
      "STEP 8: Program Execution & Support - Enter structured incubation / acceleration, Funding (if applicable) released milestone-wise, Regular reviews & mentoring, Demo days & investor connects",
    ],
    documentsRequired: [
      "Certificate of Incorporation",
      "DPIIT Recognition Certificate (if available)",
      "Pitch Deck (PDF)",
      "Founder details & profiles",
      "Product description / demo link",
      "Business model & revenue plan",
      "Financial projections",
      "Bank account details",
    ],
    applyUrl: "https://www.meity.gov.in/schemes/genesis",
    processingTime: "8-16 weeks (incubator dependent)",
    keyPoints: [
      "Apply through GENESIS-supported incubators only",
      "For tech startups with digital/emerging tech focus",
      "Funding quantum varies by call",
      "Each incubator launches own application call",
      "Structured incubation + funding combo",
    ],
  },
  // STATE GOVERNMENT SCHEMES - MADHYA PRADESH
  {
    id: 18,
    name: "MP Startup Policy (2025)",
    shortName: "MP Startup",
    category: "state-government-madhya-pradesh",
    oneLiner:
      "MP Startup Policy (2025) is the flagship state policy to support startups through financial incentives, operational support, IP benefit, marketing assistance, tender preference, and ecosystem strengthening.",
    description:
      "Financial and non-financial assistance for startups registered and operating in Madhya Pradesh.",
    fullDescription:
      "Financial and non-financial assistance for startups registered and operating in Madhya Pradesh through seed funding, marketing support, and IPR cost reimbursement.",
    detailedBenefits: [
      "Seed funding up to ₹30 lakh for product development, testing, commercialization",
      "Monthly sustenance allowance for eligible startups during incubation",
      "IPR cost reimbursement, marketing support, tender preference",
    ],
    detailedEligibility: [
      "DPIIT-recognized startup in MP",
      "Incorporated as: Private Limited Company, LLP, Partnership (as per DPIIT)",
      "Incorporated entity operating in MP",
      "Innovative/scalable product/service",
    ],
    applicationProcess: [
      "STEP 1 — Visit the Startup MP Portal: https://startupmp.mygov.co.in/ (Central portal for profile creation, applying for incentives, tracking, uploading documents, viewing status)",
      "STEP 2 — Register Your Startup Profile: Click “Register / Sign Up”, Enter email, mobile, name, create password, Verify OTP, Login (Dashboard opens for managing applications)",
      "STEP 3 — Complete Startup Profile: Basic Details (Startup name, Type, DPIIT number, Incorporation date, Office address in MP), Founders (Names, Roles, Contact), Business Model (Problem, Product/solution, Target customers), Upload (Incorporation certificate, DPIIT recognition, Pitch deck, Bank details)",
      "STEP 4 — Apply for a Specific Incentive: Go to “Apply for Benefits”, Choose incentive (Seed Funding, Patent & IPR Assistance, Marketing & Branding, Utility / Lease Subsidy, Tender Preference, Sustainability Allowance), Each has separate form",
      "STEP 5 — Fill Incentive Application Form (Example: Seed Funding): Proposed use of funds, Milestones (3–12 months), Expected outcomes, Budget breakup, Upload use of funds plan (PDF), Quotes / estimates, Milestones chart, Click Submit",
      "STEP 6 — Upload Supplementary Documents: For Patent: Patent draft, fee receipts; Marketing: Event invites, quotes; Lease/Utility: Rent agreement, bills; Tender: Tender bid documents",
      "STEP 7 — Submit & Track Status: Receive Application ID, Track from dashboard, Upload additional if requested, Nodal agency reviews and approves (All steps on Startup MP portal; No separate site)",
    ],
    documentsRequired: [
      "DPIIT recognition certificate",
      "Certificate of Incorporation",
      "PAN & GST (if applicable)",
      "Startup pitch deck",
      "Bank account details",
      "Policy Incentive-Specific: Patent assistance (Patent fee receipts / draft), Marketing support (Event quote/ invitation), Lease/utility subsidy (Rent receipts & bills), Seed funding (Detailed use of funds / milestone plan)",
    ],
    applyUrl: "https://startupmp.mygov.co.in/",
    processingTime: "4-8 weeks",
    keyPoints: [
      "Multiple benefits claimed separately",
      "State-level support + central schemes",
      "Single portal for all applications",
      "Regular status updates",
      "All incentives for DPIIT-recognized startups",
    ],
  },
  {
    id: 19,
    name: "Mukhya Mantri Yuva Udyami Yojana",
    shortName: "Yuva Udyami",
    category: "state-government-madhya-pradesh",
    oneLiner:
      "Mukhya Mantri Yuva Udyami Yojana is a flagship MP Government scheme to promote youth entrepreneurship by providing bank loans with government support. The scheme helps young entrepreneurs start manufacturing, service, or trading businesses. Loans are provided through banks, with facilitation and subsidy support from the Government of Madhya Pradesh.",
    description:
      "Loan support scheme for youth entrepreneurs in MP for business setup with margin and interest assistance.",
    fullDescription:
      "Loan support scheme for youth entrepreneurs in MP for business setup with margin and interest assistance to promote self-employment. Loans are provided through banks, with facilitation and subsidy support from the Government of Madhya Pradesh.",
    detailedBenefits: [
      "Loan Amount: Typically from ₹10 lakh up to ₹2 crore (as per project requirement and bank appraisal)",
      "Purpose: New business setup, Expansion of existing business, Working capital + fixed assets",
      "Government Facilitation: Structured routing of applications to banks, Faster screening through state systems",
      "Sector Coverage: Manufacturing, services, trading (non-agricultural)",
      "Note: Final sanction, interest rate, tenure, and collateral terms depend on bank appraisal",
    ],
    detailedEligibility: [
      "Must be a resident of Madhya Pradesh",
      "Age: Generally 18 to 40 years",
      "Individual / youth entrepreneur intending to start a business",
      "Should not be a defaulter of any bank or financial institution",
      "Business Eligibility: New business or expansion of a new venture, Eligible sectors: Manufacturing, Services, Trading, Project should be financially viable",
    ],
    applicationProcess: [
      "STEP 1: Open Mera Yuva MP Portal: https://www.merayuva.mp.gov.in/ (Youth schemes dashboard, List of entrepreneurship & self-employment schemes https://www.merayuva.mp.gov.in/schemes/Entrepreneurship%20and%20Startup)",
      "STEP 2: Register / Login: Click Register (first-time), Enter mobile number, email ID, Verify OTP, Create password and Login (User dashboard opens)",
      "STEP 3: Select the Scheme: On dashboard, go to Schemes, Click on “Mukhya Mantri Yuva Udyami Yojana” https://www.merayuva.mp.gov.in/schemes/Entrepreneurship%20and%20Startup, Read guidelines, Click Apply Now",
      "STEP 4: Fill the Online Application Form: Personal Details (Name, age, address, Aadhaar & PAN), Business Details (Type: manufacturing / service / trade, New or existing, Proposed location, Employment potential), Project & Finance Details (Total project cost, Loan amount, Own contribution, Expected revenue & repayment ability)",
      "STEP 5: Upload Documents: Scanned copies of Aadhaar & PAN, MP domicile, Project report, Cost estimates / quotations, Bank details",
      "STEP 6: Submit Application: Click Submit, Application ID generated, On-screen/email confirmation",
      "STEP 7: Application Routing to Bank: Digitally forwarded to district authority, empanelled bank, Bank conducts credit appraisal, document verification, field/telephonic checks",
      "STEP 8: Bank Approval & Loan Sanction: If approved, Bank issues sanction letter, Sign loan documents, Loan disbursed to bank account",
      "(This scheme uses the MP Online/Msme portal for online form submission)",
    ],
    documentsRequired: [
      "Personal Documents: Aadhaar Card, PAN Card, MP Domicile / Residence proof, Passport-size photograph",
      "Business Documents: Detailed Project Report / Business Plan, Estimated project cost & means of finance, Quotations for machinery/equipment (if applicable), Bank account details",
      "If Existing Business: Registration certificate (if any), GST (if applicable), Bank statements",
    ],
    applyUrl: "https://www.merayuva.mp.gov.in/",
    processingTime: "4-6 weeks (bank dependent)",
    keyPoints: [
      "For youth entrepreneurs (18-40 years)",
      "Manufacturing, services, trading sectors",
      "Government facilitation through banks",
      "Margin money and interest subsidy available",
    ],
  },
  {
    id: 20,
    name: "Mukhyamantri Udyam Kranti Yojana",
    shortName: "Udyam Kranti",
    category: "state-government-madhya-pradesh",
    oneLiner:
      "Mukhyamantri Udyam Kranti Yojana is an MP Government scheme to promote self-employment and entrepreneurship by providing bank loans with government facilitation to start or expand small businesses. The scheme supports manufacturing, service, and trading activities and is implemented through MP Online / MSME portals in coordination with banks.",
    description:
      "Self-employment loan scheme for MP residents for business establishment.",
    fullDescription:
      "Self-employment loan scheme for MP residents for business establishment providing loans from ₹50,000 to ₹50 lakh.",
    detailedBenefits: [
      "Loan Amount: From ₹50,000 up to ₹50 lakh (varies by business type and bank appraisal)",
      "Purpose of Loan: New business setup, Expansion of existing enterprise, Purchase of machinery/equipment, Working capital",
      "Government Facilitation: Digital application routing to banks, Faster preliminary screening via state systems",
      "Note: Interest rate, tenure, collateral, and final amount depend on bank appraisal",
    ],
    detailedEligibility: [
      "Applicant Eligibility: Permanent resident of Madhya Pradesh, Age generally 18–45 years (as per prevailing norms), Individual / Proprietorship / Partnership / Company / LLP, Should not be a bank defaulter",
      "Business Eligibility: New or existing enterprise in MP, Eligible sectors: Manufacturing, Services, Trading (non-agricultural), Viable business plan with repayment capacity",
    ],
    applicationProcess: [
      "1. Go to the MP Online / MSME services portal: https://msme.mponline.gov.in/ msme.mponline.gov.in",
      "2. Create an account (if not already registered) or Login",
      "3. Search for “Mukhyamantri Udyam Kranti Yojana” in the services list",
      "4. Click Apply Online for the scheme",
      "5. Complete the form with personal and business/project details",
      "6. Upload required documents: Aadhaar, PAN, bank details, project report, cost sheets, quotations",
      "7. Submit your application",
      "8. The system routes the application to the relevant MSME office/bank",
      "9. You may be asked for additional offline verification/documents at a local office",
      "10. After verification and approval, the loan sanction letter is issued and funds are released",
      "(This scheme uses the MP Online/Msme portal for online form submission)",
    ],
    documentsRequired: [
      "Personal Documents: Aadhaar Card, PAN Card, MP Domicile / Residence proof, Passport-size photograph",
      "Business / Project Documents: Project Report / Business Plan, Estimated project cost & loan requirement, Quotations for machinery/equipment (if applicable), Bank account details",
      "If Existing Business: Business registration certificate (if any), GST registration (if applicable), Bank statements (last 6 months, if available)",
    ],
    applyUrl: "https://msme.mponline.gov.in/",
    processingTime: "4-8 weeks",
    keyPoints: [
      "Broad eligibility criteria",
      "Self-employment focused",
      "All sectors covered",
      "Government-facilitated through banks",
    ],
  },
  {
    id: 21,
    name: "Mukhya Mantri Krishak Udyami Yojana",
    shortName: "Krishak Udyami",
    category: "state-government-madhya-pradesh",
    oneLiner:
      "Mukhya Mantri Krishak Udyami Yojana is a Madhya Pradesh Government scheme aimed at promoting entrepreneurship among farmers’ families to establish their businesses.",
    description:
      "Financial assistance for sons/daughters of farmers in MP to start an enterprise.",
    fullDescription:
      "Financial assistance for sons/daughters of farmers in MP to start an enterprise linked to agriculture/business.",
    detailedBenefits: [
      "For projects worth Rs 10 lakh or more: For general class 15% (maximum ₹12,00,000), For BPL category 20% (maximum ₹18,00,000), For women entrepreneurs, a 6% and male 5% interest subsidy, The guarantee fee will be payable at the prevailing rate for a maximum of 7 years",
      "For projects less than Rs 10 lakh: 15% of the project cost (maximum ₹1,00,000) for the general category, BPL/ scheduled caste / scheduled 30% of the project cost (maximum ₹2,00,000) for Tribes / Other Backward Classes (except creamy layer) / Women / Minorities / Disabled",
      "Additional provisions: 30% of the project cost (maximum ₹3,00,000) to the liberated nomadic and semi-nomadic tribes, Bhopal Gas victim family members are eligible for an additional 20% (maximum ₹1,00,000) on the project cost",
      "At the rate of 5% per annum of the capital cost for projects of ₹10,00,000 or more and at the rate of 6% per annum for women entrepreneurs, for a maximum of 7 years. (Maximum ₹5,00,000 per annum)",
      "For projects less than ₹10,00,000 5% of the project cost per annum rate and 6% for women entrepreneurs At the rate of per annum, for a maximum of 7 years. (Maximum ₹25,000 per annum)",
    ],
    detailedEligibility: [
      "Applicant Eligibility: 1. Age: 18 to 45 years, 2. Educational Qualification: 10th pass, 3. Additional Criteria: The applicant should be a permanent resident of Madhya Pradesh, The parents of the beneficiary should not have their agricultural land, The applicant should not be an income taxpayer",
      "Exclusions: 1. If the applicant is getting assistance under any other self-employment scheme, then he cannot avail of benefits under this scheme, 2. The applicant’s family should not be an income taxpayer, 3. The applicant should not be a defaulter of any bank",
    ],
    applicationProcess: [
      "Online: Step 1: Visit https://msme.mponline.gov.in/portal/Services/DCI/Index.aspx?did=RDAx&Y=MMYUY, Step 2: Click on the application link for the Mukhya Mantri Krishak Udyami Yojana https://msme.mponline.gov.in/portal/Services/DCI/Index.aspx?did=RDAx&Y=MMYUY, Step 3: Various departments associated with the scheme will be displayed. Choose the department that interests you, Step 4: Choose the option for registration or sign-up if you are a new application. Click the submit button after entering your name, mobile number, password, and captcha code, Step 5: After submitting, you will be registered on the portal, Step 6: Now, you can log in to the portal and apply for the scheme",
      "Offline: Step 1: The Applicant can apply for the Madhya Pradesh Mukhya Mantri Krishak Udyami Yojana by Filling Offline Application Form https://www.govtschemes.in/sites/default/files/2023-11/%e0%a4%ae%e0%a4%a7%e0%a5%8d%e0%a4%af%20%e0%a4%aa%e0%a5%8d%e0%a4%b0%e0%a4%a6%e0%a5%87%e0%a4%b6%20%e0%a4%ae%e0%a5%81%e0%a4%96%e0%a5%8d%e0%a4%af%e0%a4%ae%e0%a4%82%e0%a4%a4%e0%a5%8d%e0%a4%b0%e0%a5%80%20%e0%a4%95%e0%a5%83%e0%a4%b7%e0%a4%95%20%e0%a4%89%e0%a4%a6%e0%a5%8d%e0%a4%af%e0%a4%ae%e0%a5%80%20%e0%a4%af%e0%a5%8b%e0%a4%9c%e0%a4%a8%e0%a4%be%20%e0%a4%95%e0%a4%be%20%e0%a4%91%e0%a4%ab%e0%a4%b2%e0%a4%be%e0%a4%87%e0%a4%a8%20%e0%a4%86%e0%a4%b5%e0%a5%87%e0%a4%a6%e0%a4%a8%20%e0%a4%aa%e0%a4%a4%e0%a5%8d%e0%a4%b0%e0%a5%a4.pdf, Step 2: Offline application form is available at the Farmer Welfare Department /District Trade and Industry Centre Office, Step 3: Take the application Form, Fill it Correctly, Step 4: Attach all the required documents with the application form and submit the Madhya Pradesh Mukhya Mantri Krishna Udyami Yojana Offline Application Form along with all documents to the Department of Farmer Welfare/District Trade and Industry Centre, Step 5: Received Application Forms along with the documents will be verified by the Department Officers, Step 6: After the verification, the applicant will start getting the benefits of the Scheme",
    ],
    documentsRequired: [
      "1. Aadhar Card",
      "2. PAN Card",
      "3. Birth certificate",
      "4. BPL certificate",
      "5. Land farming paper",
      "6. Income certificate",
      "7. Address proof",
      "8. Passport size photo",
      "9. Mobile number",
      "10. 10th class mark sheet",
    ],
    applyUrl:
      "https://msme.mponline.gov.in/portal/Services/DCI/Index.aspx?did=RDAx&Y=MMYUY",
    processingTime: "4-6 weeks",
    keyPoints: [
      "For farmers' families only",
      "Age limit 18-45 years",
      "10th pass minimum education",
      "Agribusiness/agriculture-linked enterprises",
      "Both online and offline application options",
      "Special provisions for SC/ST/women/minorities",
    ],
  },
];

const seedSchemes = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
<<<<<<< HEAD
    console.log('✅ MongoDB Connected');

    await Scheme.deleteMany({});
    console.log('🗑️  Existing schemes deleted');
=======
    console.log("✅ MongoDB Connected");

    await Scheme.deleteMany({});
    console.log("🗑️  Existing schemes deleted");
>>>>>>> 459c204bdf6256256ca54843cfd89b8d46523c27

    await Scheme.insertMany(schemesData);
    console.log(`✅ ${schemesData.length} schemes inserted successfully!`);

    await mongoose.connection.close();
<<<<<<< HEAD
    console.log('👋 Database connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
=======
    console.log("👋 Database connection closed");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
>>>>>>> 459c204bdf6256256ca54843cfd89b8d46523c27
    process.exit(1);
  }
};

<<<<<<< HEAD
seedSchemes();
=======
seedSchemes();
>>>>>>> 459c204bdf6256256ca54843cfd89b8d46523c27
