require('dotenv').config();
const mongoose = require('mongoose');
const Scheme = require('../models/Scheme');


const MONGO_URI = process.env.MONGO_URI
const schemesData = [
  // Government of India Schemes
  {
    id: 1,
    name: 'Startup India (DPIIT Recognition)',
    shortName: 'DPIIT Recognition',
    category: 'government-of-india',
    description: 'Official Government of India recognition that unlocks tax, funding, and regulatory benefits for startups.',
    fullDescription: 'Official Government of India recognition that unlocks tax, funding, and regulatory benefits for startups. This is the flagship recognition program that provides income tax exemption, angel tax exemption, IPR support, and government tender access.',
    detailedBenefits: [
      'Income Tax Exemption (Section 80-IAC) - 100% tax exemption for any 3 consecutive years out of first 10 years',
      'Angel Tax Exemption (Section 56) - Investments above FMV not taxed',
      'IPR Support - 80% rebate on patent filing with fast-track examination',
      'Government Tender Access - No prior experience and no turnover requirement',
      'Easy compliance - Self-certification under labour and environment laws'
    ],
    detailedEligibility: [
      'Incorporated in India (Pvt Ltd / LLP / Partnership)',
      'Less than 10 years from incorporation',
      'Annual turnover ≤ ₹100 Cr',
      'Working on innovation, improvement, or scalable model'
    ],
    applicationProcess: [
      '1. Visit: https://www.startupindia.gov.in',
      '2. Create startup login',
      '3. Fill "Apply for DPIIT Recognition"',
      '4. Upload documents & self-certification',
      '5. Submit application',
      '6. DPIIT reviews → Recognition certificate issued'
    ],
    documentsRequired: [
      'Certificate of Incorporation',
      'PAN of entity',
      'Founder/Director details',
      'Innovation & scalability write-up',
      'Website/app link (if any)'
    ],
    applyUrl: 'https://www.startupindia.gov.in/'
  },
  {
    id: 2,
    name: 'Startup India Seed Fund Scheme',
    shortName: 'SISFS',
    category: 'government-of-india',
    description: 'Government seed funding for early-stage startups via approved incubators.',
    fullDescription: 'Government seed funding for early-stage startups via approved incubators. Provides prototype/PoC grants up to ₹20 lakh and market entry support up to ₹50 lakh through convertible debentures without equity dilution.',
    detailedBenefits: [
      'Prototype / PoC Grant: Up to ₹20 lakh',
      'Market entry / scaling support: Up to ₹50 lakh (convertible debenture / debt)',
      'Mentorship and incubation support',
      'No equity taken directly by Government'
    ],
    detailedEligibility: [
      'DPIIT-recognized startup',
      'Incorporated within last 2 years',
      'Not received more than ₹10 lakh from any government scheme',
      'Innovative & scalable business model'
    ],
    applicationProcess: [
      '1. Visit: https://www.startupindia.gov.in',
      '2. Login → Seed Fund Scheme section',
      '3. Choose preferred incubator',
      '4. Submit application with documents',
      '5. Incubator Screening Committee evaluation',
      '6. Approval → Milestone-based fund release'
    ],
    documentsRequired: [
      'DPIIT recognition certificate',
      'Pitch deck',
      'Detailed business plan',
      'Founder KYC',
      'Bank details'
    ],
    applyUrl: 'https://www.startupindia.gov.in/'
  },
  {
    id: 3,
    name: 'Fund of Funds for Startups',
    shortName: 'FFS – SIDBI',
    category: 'government-of-india',
    description: 'Government capital deployed into startups indirectly through VC funds.',
    fullDescription: 'Government capital deployed into startups indirectly through VC funds. Enables large equity funding (₹1 Cr+) without direct government equity dilution and increases investor confidence.',
    detailedBenefits: [
      'Large equity funding (₹1 Cr+ possible)',
      'Government does not directly dilute founder equity',
      'Higher investor confidence',
      'Long-term capital availability'
    ],
    detailedEligibility: [
      'DPIIT-recognized startup',
      'VC-fundable business model',
      'High growth & scalability potential'
    ],
    applicationProcess: [
      '1. Visit: https://www.sidbi.in',
      '2. Identify SIDBI-empanelled VC fund',
      '3. Pitch startup to VC',
      '4. VC conducts due diligence',
      '5. SIDBI invests in VC → VC invests in startup'
    ],
    documentsRequired: [
      'Pitch deck',
      'Financial projections',
      'Cap table',
      'DPIIT certificate'
    ],
    applyUrl: 'https://www.sidbi.in/'
  },
  {
    id: 4,
    name: 'Credit Guarantee Scheme for Startups',
    shortName: 'CGSS',
    category: 'government-of-india',
    description: 'Government guarantee enabling collateral-free loans for startups.',
    fullDescription: 'Government guarantee enabling collateral-free loans for startups. Reduces risk for banks and enables faster loan approvals with easier access to working capital and term loans.',
    detailedBenefits: [
      'Collateral-free bank loans',
      'Reduced risk for banks',
      'Easier access to working capital & term loans',
      'Faster loan approvals'
    ],
    detailedEligibility: [
      'DPIIT-recognized startup',
      'Loan from scheduled bank / NBFC',
      'Loan used for business purposes'
    ],
    applicationProcess: [
      '1. Startup applies for loan at bank',
      '2. Bank evaluates proposal',
      '3. Bank applies for CGSS guarantee',
      '4. Guarantee approved by NCGTC',
      '5. Loan disbursed to startup'
    ],
    documentsRequired: [
      'DPIIT certificate',
      'Loan proposal',
      'Financial projections',
      'Bank KYC'
    ],
    applyUrl: 'https://www.startupindia.gov.in/'
  },
  {
    id: 5,
    name: 'Pradhan Mantri MUDRA Yojana',
    shortName: 'PMMY',
    category: 'government-of-india',
    description: 'Collateral-free loans for micro and early-stage businesses.',
    fullDescription: 'Collateral-free loans for micro and early-stage businesses. Offers loans from ₹50,000 to ₹20 lakh with low documentation requirements suitable for very early-stage startups.',
    detailedBenefits: [
      'Loan up to ₹20 lakh',
      'No collateral required',
      'Suitable for very early-stage startups',
      'Low documentation',
      'Flexible repayment terms up to 5 years',
      'Available through all nationalized banks',
      'Competitive interest rates (typically 8-12%)',
      'Easy and quick application process'
    ],
    detailedEligibility: [
      'Must be an Indian citizen',
      'Non-agricultural business enterprise',
      'No collateral security required',
      'Profit-making or viable business venture',
      'Business plan and financial documentation',
      'Age criteria: 18 years or above',
      'No prior loan defaults or negative credit history'
    ],
    applicationProcess: [
      '1. Visit: https://www.mudra.org.in',
      '2. Choose loan type: Shishu (up to ₹50k), Kishore (₹50k–₹5L), Tarun (₹5L–₹10L), Tarun plus (₹10L–₹20L)',
      '3. Apply via bank/NBFC',
      '4. Bank appraisal',
      '5. Loan sanction & disbursement'
    ],
    documentsRequired: [
      'Aadhar Card or PAN Card',
      'Proof of residence (electricity bill/water bill)',
      'Passport size photographs (4)',
      'Business plan document',
      'Proof of business address',
      'Bank statement (last 6 months)',
      'GST registration (if applicable)',
      'List of equipment/machinery to be purchased'
    ],
    applyUrl: 'https://www.mudra.org.in/'
  },
  {
    id: 6,
    name: 'SAMRIDH Scheme',
    shortName: 'SAMRIDH',
    category: 'government-of-india',
    description: 'Acceleration and funding support for software product startups.',
    fullDescription: 'Acceleration and funding support for software product startups under MeitY. Provides funding up to ₹40 lakh with 50% government support, market access, and accelerator mentorship.',
    detailedBenefits: [
      'Funding up to ₹40 lakh (50% govt support)',
      'Market access & enterprise customers',
      'Accelerator mentorship',
      'Product commercialization support'
    ],
    detailedEligibility: [
      'Software product startup',
      'DPIIT-recognized',
      'Revenue or pilot customers preferred'
    ],
    applicationProcess: [
      '1. Visit: https://www.meity.gov.in/samridh',
      '2. Apply through empaneled accelerator',
      '3. Screening & evaluation',
      '4. Cohort selection',
      '5. Funding + acceleration support'
    ],
    documentsRequired: [
      'Product demo',
      'Pitch deck',
      'Incorporation certificate',
      'Financial details'
    ],
    applyUrl: 'https://www.meity.gov.in/samridh'
  },
  {
    id: 7,
    name: 'MSME Innovative / Incubation Scheme',
    shortName: 'MSME Innovation',
    category: 'government-of-india',
    description: 'Grant support for MSMEs working on innovation and commercialization.',
    fullDescription: 'Grant support for MSMEs working on innovation and commercialization. Provides grants up to ₹15 lakh for prototype and pilot funding through approved incubators.',
    detailedBenefits: [
      'Grant up to ₹15 lakh',
      'Prototype & pilot funding',
      'Industry & market linkage',
      'Support through approved incubators'
    ],
    detailedEligibility: [
      'Udyam-registered MSME',
      'Innovative product/service',
      'Indian entity'
    ],
    applicationProcess: [
      '1. Visit: https://www.msme.gov.in',
      '2. Apply under MSME Innovative Scheme',
      '3. Select incubator / host institution',
      '4. Proposal evaluation',
      '5. Grant approval & release'
    ],
    documentsRequired: [
      'Udyam registration',
      'Project proposal',
      'Bank account details'
    ],
    applyUrl: 'https://www.msme.gov.in/'
  },
  {
    id: 8,
    name: 'NIDHI – National Initiative for Developing and Harnessing Innovations',
    shortName: 'NIDHI',
    category: 'government-of-india',
    description: 'Umbrella programme by Department of Science & Technology to support startup idea → prototype → commercialization.',
    fullDescription: 'Umbrella programme by Department of Science & Technology (DST) to support startup idea → prototype → commercialization through multiple sub-programs including NIDHI-SSP, PRAYAS, and TBI network.',
    detailedBenefits: [
      'Early-stage seed funding through incubator support (up to ₹1 Cr via NIDHI-SSP)',
      'Prototype/Proof-of-Concept grants (e.g., PRAYAS, NIDHI-PRAYAS up to ₹10L)',
      'Incubator/accelerator support & mentoring through TBI/CoE network',
      'Structured pathways from idea to scaled technology',
      'Access to investor networks'
    ],
    detailedEligibility: [
      'Indian startup or individual innovator (Indian citizen)',
      'Startup should be eligible under respective sub-program rules',
      'Registered/incubated with a DST-recognized incubator (for some programs)'
    ],
    applicationProcess: [
      '1. Identify sub-program under NIDHI (e.g., SSP, PRAYAS, TBI) relevant to your stage',
      '2. Visit the official NIDHI portal: https://nidhi.dst.gov.in',
      '3. Look for open calls for applications under the chosen sub-program',
      '4. Submit application/form to the listed incubator/TBI associated with NIDHI',
      '5. Incubator/TBI conducts initial screening & technical review',
      '6. Final selection and release of funds/support to startup'
    ],
    documentsRequired: [
      'Business/pitch proposal',
      'Proof of concept/innovation document',
      'Founder KYC (PAN/Aadhaar)',
      'Company incorporation certificate (if applicable)',
      'Incubator/TBI endorsement where required'
    ],
    applyUrl: 'https://nidhi.dst.gov.in/'
  },
  {
    id: 9,
    name: 'Biotechnology Ignition Grant',
    shortName: 'BIG',
    category: 'government-of-india',
    description: 'Grant support of up to ₹50 lakh to biotech/healthcare/biomedical startups for proof-of-concept and early development.',
    fullDescription: 'Grant support from BIRAC, DBT of up to ₹50 lakh to biotech/healthcare/biomedical startups for proof-of-concept and early development over 18 months with mentorship support.',
    detailedBenefits: [
      'Up to ₹50 lakh grant-in-aid over 18 months for early stage innovation',
      'Mentorship, networking, and commercialization support via BIG partners nationwide',
      'Focused on biotechnology, diagnostics, medical devices, bio-materials, etc.'
    ],
    detailedEligibility: [
      'Indian startup/company incorporated in India (LLP/Pvt Ltd)',
      'Must be incubated in a recognized incubator (for lack of own lab)',
      'Project should aim for commercially viable proof-of-concept'
    ],
    applicationProcess: [
      '1. Visit the official BIG page: https://birac.nic.in/big.php',
      '2. Check open call notifications (usually 2x per year)',
      '3. Download the application form and guidelines',
      '4. Prepare a technical proposal with commercialization plan',
      '5. Submit application through the BIG partner/incubator portal',
      '6. Proposal undergoes technical review → expert committee evaluation',
      '7. Upon selection, grant released and mentoring support begins'
    ],
    documentsRequired: [
      'Detailed biotech project proposal/abstract',
      'Company incorporation certificate',
      'Founder/PI KYC and CVs',
      'Incubator endorsement & MoU (if incubated)'
    ],
    applyUrl: 'https://birac.nic.in/big.php'
  },
  {
    id: 10,
    name: 'GENESIS (Gen-Next Support for Innovative Startups)',
    shortName: 'GENESIS',
    category: 'government-of-india',
    description: 'Support and scaling programme under MeitY for tech startups, focused on growth, market penetration and sustained operation.',
    fullDescription: 'Support and scaling programme under MeitY / NSTEDB for tech startups, focused on growth, market penetration and sustained operation with funding for early commercial scaling.',
    detailedBenefits: [
      'Funding support for early commercial scaling (quantum varies by call)',
      'Mentorship & ecosystem access through government partners',
      'Encourages digital and deep tech innovation alignment with national priorities'
    ],
    detailedEligibility: [
      'Indian tech startup focused on digital or emerging technologies',
      'Should be registered (Pvt Ltd / LLP) in India',
      'Typically DPIIT recognition helps but specific calls list precise requirements'
    ],
    applicationProcess: [
      '1. Visit the GENESIS scheme page: https://msh.meity.gov.in/schemes/genesis',
      '2. Check open Application Calls and guidelines',
      '3. Create an account (if needed) on the portal',
      '4. Fill the online application form with required details',
      '5. Upload documents as per checklist',
      '6. Submission → evaluation by expert panel → selection',
      '7. Funding + support is disbursed to selected startups'
    ],
    documentsRequired: [
      'Innovation/tech product pitch deck',
      'Incorporation & KYC',
      'Financial projections',
      'Technical whitepaper/product details'
    ],
    applyUrl: 'https://msh.meity.gov.in/schemes/genesis'
  },
  {
    id: 11,
    name: 'Credit Guarantee Trust Fund',
    shortName: 'CGTMSE',
    category: 'government-of-india',
    description: 'Guarantee coverage for collateral-free loans to startups and micro enterprises.',
    fullDescription: 'The Credit Guarantee Trust Fund for Micro and Small Enterprises (CGTMSE) is a government-backed guarantee scheme that enables micro and small enterprises to access credit from banks without submitting collateral.',
    detailedBenefits: [
      'Credit facility available up to ₹2 crores',
      'Up to 85% guarantee coverage on loan amount',
      'Zero collateral requirement for loan',
      'Quick and simplified loan approval process',
      'Competitive interest rates from banks',
      'Flexible repayment tenure (up to 7 years)',
      'Reduced documentation requirements',
      'Support for all types of businesses'
    ],
    detailedEligibility: [
      'Operating in manufacturing or service sector',
      'Business registration certificate required',
      'Compliance with annual turnover limits',
      'Demonstration of financial soundness',
      'Viable business plan with market feasibility',
      'Business operating for minimum 1-2 years',
      'No previous loan defaults or bad debts',
      'Indian registered entity'
    ],
    applicationProcess: [
      '1. Identify participating banks or financial institutions',
      '2. Prepare business plan and financial statements',
      '3. Apply for credit to the selected bank',
      '4. Bank verifies eligibility and processes application',
      '5. Apply for guarantee coverage from CGTMSE',
      '6. CGTMSE evaluates and approves guarantee',
      '7. Bank disburses loan amount',
      '8. Start repayment as per agreed schedule'
    ],
    documentsRequired: [
      'Business registration and license documents',
      'PAN and GST registration',
      'Last 2 years financial statements',
      'Business plan and financial projections',
      'Bank statements (last 6 months)',
      'Aadhar and passport of directors',
      'Proof of business premises',
      'List of existing assets and liabilities'
    ],
    applyUrl: 'https://www.startupindia.gov.in/'
  },
  {
    id: 12,
    name: 'Atal Incubation Centre',
    shortName: 'AIC',
    category: 'government-of-india',
    description: 'Comprehensive support for tech-based early-stage startups through incubation centers.',
    fullDescription: 'The Atal Incubation Centre (AIC) initiative aims to create and nurture high-quality early-stage tech startups and entrepreneurs through world-class incubation facilities and mentoring support.',
    detailedBenefits: [
      'Subsidized office space in state-of-the-art incubation centers',
      'Expert mentoring from industry veterans',
      'Funding support up to ₹20 lakhs per startup',
      'Access to advanced technology and resources',
      'Networking opportunities with investors and partners',
      'Business development and strategy support',
      'Legal and IP advisory services',
      'Market research and customer validation assistance'
    ],
    detailedEligibility: [
      'Registered startup or pre-incorporation team',
      'Technology-based or innovation-driven idea',
      'Strong and capable founding team',
      'Clear demonstration of market potential',
      'Commitment to full-time business development',
      'Innovative solution to real market problem',
      'Scalable business model',
      'Willingness to accept mentoring and guidance'
    ],
    applicationProcess: [
      '1. Research and identify nearby AIC centers',
      '2. Review their specific incubation programs',
      '3. Prepare pitch deck and business plan',
      '4. Register and submit online application',
      '5. Attend presentation/interview round',
      '6. Await selection committee decision',
      '7. Sign incubation agreement',
      '8. Start your incubation journey'
    ],
    documentsRequired: [
      'Startup registration certificate (if registered)',
      'Detailed business plan',
      'Pitch deck and financial projections',
      'Team member CVs and backgrounds',
      'Market research and competitor analysis',
      'Patent details and IP information (if any)',
      'Technology architecture documentation',
      'Prototype or MVP demonstration video'
    ],
    applyUrl: 'https://www.startupindia.gov.in/'
  },
  {
    id: 13,
    name: 'National Startup Award',
    shortName: 'NSA',
    category: 'government-of-india',
    description: 'Recognition and awards for outstanding startup impact and innovation.',
    fullDescription: 'The National Startup Award is a prestigious recognition program that honors exceptional startups that have demonstrated outstanding innovation, growth, and positive impact on society and the economy.',
    detailedBenefits: [
      'National recognition and visibility on government platform',
      'Cash prize rewards up to ₹1 crore (for selected categories)',
      'Extensive media coverage and PR support',
      'Networking opportunities with government officials',
      'Access to premium mentorship and advisory programs',
      'International exposure and delegation opportunities',
      'Listing on StartUp India official database',
      'Priority for government procurement opportunities'
    ],
    detailedEligibility: [
      'Registered startup with minimum 2 years of operation',
      'Demonstrated business success and revenue growth',
      'Innovation in product, service, or business model',
      'Positive social or economic impact',
      'Compliance with all regulatory requirements',
      'Clear financial records and transparency',
      'Strong team with relevant expertise',
      'Operating in priority sectors (optional but preferred)'
    ],
    applicationProcess: [
      '1. Visit StartUp India portal and award section',
      '2. Review award categories and criteria',
      '3. Prepare comprehensive application',
      '4. Highlight achievements and impact metrics',
      '5. Submit application with supporting documents',
      '6. Pass initial screening and document verification',
      '7. Present before evaluation committee',
      '8. Announce winners and awards ceremony'
    ],
    documentsRequired: [
      'Startup registration certificate',
      'Last 2-3 years financial statements',
      'Annual reports and tax returns',
      'Details of awards and recognition received',
      'Impact metrics and case studies',
      'Media coverage and press releases',
      'Customer testimonials and feedback',
      'Patent certificates and IP documents'
    ],
    applyUrl: 'https://www.startupindia.gov.in/'
  },
  {
    id: 14,
    name: 'Stand Up India Scheme',
    shortName: 'Stand Up',
    category: 'government-of-india',
    description: 'Bank loans for SC/ST and women entrepreneurs for greenfield enterprises.',
    fullDescription: 'The Stand Up India Scheme aims to promote entrepreneurship among SC/ST communities and women by providing bank loans for greenfield enterprises in manufacturing, services, or trading sectors.',
    detailedBenefits: [
      'Bank loans available up to ₹1 crore',
      'Flexible and manageable repayment terms',
      'Business mentoring and support',
      'Collateral-light lending approach',
      'Priority sector lending benefits',
      'Concessional interest rates (up to 0.5% discount)',
      'Government guarantee on loan',
      'Assistance with business planning'
    ],
    detailedEligibility: [
      'SC/ST category individual OR woman entrepreneur',
      'Greenfield enterprise (first-time business)',
      'Minimum debt contribution of ₹10 lakhs',
      'Business plan for manufacturing/services/trading',
      'Age between 18-65 years',
      'Not an undischarged insolvent',
      'No default in any government scheme',
      'Indian citizen'
    ],
    applicationProcess: [
      '1. Identify participating bank for Stand Up scheme',
      '2. Prepare detailed business plan',
      '3. Approach bank with complete documentation',
      '4. Bank verifies SC/ST/woman entrepreneur status',
      '5. Formal loan application submission',
      '6. Bank conducts appraisal and assessment',
      '7. Loan approval and disbursement',
      '8. Ongoing mentoring support from bank'
    ],
    documentsRequired: [
      'Aadhar Card and PAN Card',
      'SC/ST certificate or woman entrepreneur proof',
      'Detailed project report',
      'Cost estimate and financial projections',
      'Bank statements (last 6 months)',
      'Technical qualifications and experience',
      'Business address and location details',
      'ITR (if any previous income)'
    ],
    applyUrl: 'https://www.standupmitra.in/'
  },
  {
    id: 15,
    name: 'Startup India IP Protection',
    shortName: 'IP Protection',
    category: 'government-of-india',
    description: 'Support for patent filings and intellectual property protection for startups.',
    fullDescription: 'The Startup India Intellectual Property Protection Scheme provides financial and technical support to help startups file patents, copyrights, and trademarks for their innovations.',
    detailedBenefits: [
      '80% rebate on patent filing and prosecution fees',
      'Fast-track examination facilities',
      'Expert legal assistance for IP filings',
      'Support for 5 years from registration',
      'Design and trademark filing support',
      'Copyright registration assistance',
      'IP audit and valuation services',
      'International patent filing support (partial)'
    ],
    detailedEligibility: [
      'Registered startup in India',
      'Unique and innovative technology/product',
      'Feasible and commercially viable invention',
      'Clear ownership and IP documentation',
      'Team with relevant technical expertise',
      'No previous IP filing or minimal filings',
      'First-time applicants get priority',
      'Technology not publicly disclosed'
    ],
    applicationProcess: [
      '1. Register on Startup India portal',
      '2. Get Startup India certificate',
      '3. Identify intellectual property to protect',
      '4. Consult with patent agent/lawyer',
      '5. Prepare complete patent specification',
      '6. Apply for registration with IP office',
      '7. Startup India provides rebate documentation',
      '8. Receive IP protection and certificate'
    ],
    documentsRequired: [
      'Startup registration certificate',
      'Detailed description of innovation',
      'Technical documentation and drawings',
      'Patent specification (if applicable)',
      'Proof of non-disclosure (if applicable)',
      'Claim of small entity status',
      'Identity proof of inventors',
      'Company registration documents'
    ],
    applyUrl: 'https://www.startupindia.gov.in/content/sih/en/ip-protection.html'
  },

  // State Government Schemes
  {
    id: 16,
    name: 'SEWA Fund for Women',
    shortName: 'SEWA',
    category: 'state-government',
    description: 'Specialized financial and non-financial support for women entrepreneurs.',
    fullDescription: 'The Self-Employed Women Association (SEWA) Fund provides specialized financial and non-financial support to encourage and empower women entrepreneurs in starting and scaling their businesses.',
    detailedBenefits: [
      'Microfinance loans and credit facilities',
      'Skill development and training programs',
      'Market linkage and distribution support',
      'Business counseling and mentoring services',
      'Access to women entrepreneurship networks',
      'Subsidized business consultancy services',
      'Legal aid and documentation support',
      'Group savings and community support schemes'
    ],
    detailedEligibility: [
      'Must be a female entrepreneur or business owner',
      'Business idea with clear viability',
      'Willingness to undertake training programs',
      'Commitment to business growth and development',
      'Primary breadwinner status (preferred)',
      'Minimum age 18 years',
      'Marginalized or economically vulnerable status',
      'Interest in collective working and community support'
    ],
    applicationProcess: [
      '1. Contact nearest SEWA branch or member',
      '2. Attend orientation and information session',
      '3. Prepare business plan and financial proposal',
      '4. Complete membership registration process',
      '5. Provide personal and business documents',
      '6. Meet with SEWA advisor for counseling',
      '7. Submit formal loan application',
      '8. Receive approval and loan disbursement'
    ],
    documentsRequired: [
      'Aadhar Card',
      'Voter ID or Passport',
      'Proof of residence',
      'Business plan and cost estimate',
      'Passport photographs',
      'Bank account details',
      'Business license (if applicable)',
      'Group membership certificate (if applicable)'
    ],
    applyUrl: 'https://www.sewa.org/'
  },
  {
    id: 17,
    name: 'District Industry Centre',
    shortName: 'DIC',
    category: 'state-government',
    description: 'Local support and resources for startups and enterprises at district level.',
    fullDescription: 'District Industry Centers (DICs) are government institutions that provide localized support, guidance, and resources to help startups and small enterprises succeed at the district level.',
    detailedBenefits: [
      'Free business registration and licensing assistance',
      'Comprehensive subsidy information and guidance',
      'Industry-specific support programs',
      'Market research and business intelligence',
      'Local network and vendor connections',
      'Training and skill development programs',
      'Support in setting up manufacturing units',
      'Connect with government schemes and incentives'
    ],
    detailedEligibility: [
      'Local business or startup in the district',
      'Viability of business plan',
      'Compliance with local regulations',
      'Willingness to follow DIC guidelines',
      'Any industry or sector (except restricted ones)',
      'Minimum investment thresholds (varies by state)',
      'Employment generation capability',
      'Environmental compliance'
    ],
    applicationProcess: [
      '1. Visit District Industry Centre office',
      '2. Meet project officer to discuss business idea',
      '3. Register with DIC and create file',
      '4. Prepare detailed project report',
      '5. Discuss eligibility for subsidies/schemes',
      '6. Apply for relevant government schemes',
      '7. Receive assistance with land and building',
      '8. Support for equipment procurement'
    ],
    documentsRequired: [
      'Identity proof (Aadhar/Passport)',
      'Proof of residence',
      'Educational qualifications',
      'Detailed project report',
      'Cost estimate and financial projections',
      'Land/building details and documents',
      'Experience and past achievements (if any)',
      'List of machinery and equipment'
    ],
    applyUrl: 'https://dcmsme.gov.in/dic.htm'
  },

  // Madhya Pradesh Government Schemes
  {
    id: 18,
    name: 'MP Startup Policy Incentives',
    shortName: 'MP Startup',
    category: 'state-government-madhya-pradesh',
    description: 'Financial and non-financial assistance for startups registered and operating in Madhya Pradesh.',
    fullDescription: 'Financial and non-financial assistance for startups registered and operating in Madhya Pradesh through seed funding, marketing support, and IPR cost reimbursement.',
    detailedBenefits: [
      'Seed funding up to ₹30 lakh for product development, testing, commercialization',
      'Monthly sustenance allowance for eligible startups during incubation',
      'IPR cost reimbursement',
      'Marketing support',
      'Tender preference'
    ],
    detailedEligibility: [
      'DPIIT-recognized startup in MP',
      'Incorporated entity operating in MP',
      'Innovative/scalable product/service'
    ],
    applicationProcess: [
      '1. Open your browser and go to: https://startupmp.mygov.co.in/',
      '2. Click "Register" and complete signup with email/phone',
      '3. Login using your credentials',
      '4. Complete your startup profile',
      '5. Navigate to "Apply for Policy Incentives"',
      '6. Choose the benefit category you want',
      '7. Upload required documents',
      '8. Submit for review and track status'
    ],
    documentsRequired: [
      'DPIIT certificate',
      'Incorporation certificate',
      'Pitch deck & business plan',
      'Bank account details',
      'Proof of operation in MP'
    ],
    applyUrl: 'https://startupmp.mygov.co.in/'
  },
  {
    id: 19,
    name: 'Mukhya Mantri Yuva Udyami Yojana',
    shortName: 'Yuva Udyami',
    category: 'state-government-madhya-pradesh',
    description: 'Loan support scheme for youth entrepreneurs in MP for business setup with margin and interest assistance.',
    fullDescription: 'Loan support scheme for youth entrepreneurs in MP for business setup with margin and interest assistance to promote self-employment.',
    detailedBenefits: [
      'Loan support ₹10 lakh to ₹2 crore',
      'Margin money subsidy (state support)',
      'Interest subsidy for defined period for reduced cost'
    ],
    detailedEligibility: [
      'MP resident',
      'Entrepreneur seeking to start/expand business'
    ],
    applicationProcess: [
      '1. Go to MP Online portal: https://msme.mponline.gov.in/',
      '2. Create account or Login',
      '3. Search for "Mukhyamantri Udyam Kranti Yojana"',
      '4. Click Apply Online',
      '5. Complete form with personal and business details',
      '6. Upload required documents',
      '7. Submit application',
      '8. Verification and approval process',
      '9. Loan sanction and fund release'
    ],
    documentsRequired: [
      'Aadhaar & PAN',
      'Domicile proof',
      'Project report (cost, revenue)',
      'Bank account details',
      'Educational proof'
    ],
    applyUrl: 'https://msme.mponline.gov.in/'
  },
  {
    id: 20,
    name: 'Mukhyamantri Udyam Kranti Yojana',
    shortName: 'Udyam Kranti',
    category: 'state-government-madhya-pradesh',
    description: 'Self-employment loan scheme for MP residents for business establishment.',
    fullDescription: 'Self-employment loan scheme for MP residents for business establishment providing loans from ₹50,000 to ₹50 lakh.',
    detailedBenefits: [
      'Loan from ₹50,000 up to ₹50 lakh for MSME/business',
      'Encourages self-employment and enterprise growth'
    ],
    detailedEligibility: [
      'MP resident (individual/entrepreneur)',
      'Viable business plan'
    ],
    applicationProcess: [
      '1. Go to MP Online portal: https://msme.mponline.gov.in/',
      '2. Create account or Login',
      '3. Search for "Mukhyamantri Udyam Kranti Yojana"',
      '4. Click Apply Online',
      '5. Complete form with personal and business details',
      '6. Upload required documents',
      '7. Submit application',
      '8. Verification and approval process',
      '9. Loan sanction and fund release'
    ],
    documentsRequired: [
      'Aadhaar & PAN',
      'Address proof',
      'Bank account details',
      'Project report & quotations'
    ],
    applyUrl: 'https://msme.mponline.gov.in/'
  },
  {
    id: 21,
    name: 'Mukhya Mantri Krishak Udyami Yojana',
    shortName: 'Krishak Udyami',
    category: 'state-government-madhya-pradesh',
    description: 'Financial assistance for sons/daughters of farmers in MP to start an enterprise.',
    fullDescription: 'Financial assistance for sons/daughters of farmers in MP to start an enterprise linked to agriculture/business.',
    detailedBenefits: [
      'Loan up to ₹50,000 – ₹10 lakh for agribusiness'
    ],
    detailedEligibility: [
      'Son/daughter of farmer and MP resident',
      'Proposed business linked to agriculture/enterprise'
    ],
    applicationProcess: [
      '1. Visit Mera Yuva MP Portal: https://www.merayuva.mp.gov.in/scheme/mukhya-mantri-krishak-udyami-yojana',
      '2. Login with registered credentials',
      '3. Find application form for the scheme',
      '4. Fill applicant details and business plan',
      '5. Upload required documents',
      '6. Submit form',
      '7. Bank evaluation and appraisal',
      '8. Loan sanction and disbursement'
    ],
    documentsRequired: [
      'Proof of farmer family (land record or certificate)',
      'Aadhaar & PAN',
      'Bank account details',
      'Business project plan'
    ],
    applyUrl: 'https://www.merayuva.mp.gov.in/'
  },
  {
    id: 22,
    name: 'MP MSME Capital Subsidy & Enterprise Promotion',
    shortName: 'Capital Subsidy',
    category: 'state-government-madhya-pradesh',
    description: 'State MSME support scheme offering capital investment subsidy and technology adoption incentives.',
    fullDescription: 'State MSME support scheme offering capital investment subsidy and technology adoption incentives under MP Industrial Policy.',
    detailedBenefits: [
      'Capital subsidy up to ~40–48% of eligible investment (depends on category)',
      'Support for tech upgrades and quality certification'
    ],
    detailedEligibility: [
      'Udyam-registered MSME in Madhya Pradesh'
    ],
    applicationProcess: [
      '1. Open MSME/Industrial Promotion Portal: https://msme.mponline.gov.in/',
      '2. Register or Login',
      '3. Search for capital subsidy/enterprise support scheme',
      '4. Click Apply Online',
      '5. Complete application with project details',
      '6. Upload documents: Udyam registration, GST, bank details, project invoices',
      '7. Submit for verification',
      '8. State MSME/Industrial Department reviews',
      '9. Subsidy amount transferred to bank account'
    ],
    documentsRequired: [
      'Udyam registration certificate',
      'Project investment plan & invoices',
      'GST & bank details',
      'Lease/land proof'
    ],
    applyUrl: 'https://msme.mponline.gov.in/'
  },
  {
    id: 23,
    name: 'MP Startup Patent & IPR Support',
    shortName: 'MP IPR Support',
    category: 'state-government-madhya-pradesh',
    description: 'State support for reimbursement of patent and intellectual property costs for startups.',
    fullDescription: 'State support for reimbursement of patent and intellectual property costs for startups operating in Madhya Pradesh.',
    detailedBenefits: [
      'Partial reimbursement of patent filing/prosecution fees'
    ],
    detailedEligibility: [
      'DPIIT-recognized MP startup'
    ],
    applicationProcess: [
      '1. Go to Startup MP Policy Portal: https://startupmp.mygov.co.in/',
      '2. Login with registered credentials',
      '3. Find section for IPR/Patent Support',
      '4. Select patent or IPR type for reimbursement',
      '5. Upload patent filing receipts, fee invoices, DPIIT certificate, bank details',
      '6. Submit application',
      '7. Nodal agency reviews and approves',
      '8. Reimbursement credited to bank account'
    ],
    documentsRequired: [
      'Patent fee receipts/policy claims',
      'Startup registration details'
    ],
    applyUrl: 'https://startupmp.mygov.co.in/'
  },
  {
    id: 24,
    name: 'MP Marketing & Branding Assistance',
    shortName: 'Marketing Assistance',
    category: 'state-government-madhya-pradesh',
    description: 'Subsidy support for MP startups to attend trade shows, exhibitions, and market outreach events.',
    fullDescription: 'Subsidy support for MP startups to attend trade shows, exhibitions, and market outreach events for brand building and market expansion.',
    detailedBenefits: [
      'Partial subsidy for stall fees, travel, marketing materials'
    ],
    detailedEligibility: [
      'DPIIT-recognized startup based in MP'
    ],
    applicationProcess: [
      '1. Login on the Startup MP portal',
      '2. Choose Marketing & Branding Assistance',
      '3. Input event details and upload fees/quotations',
      '4. Submit for approval',
      '5. Upon approval, subsidy released to startup'
    ],
    documentsRequired: [
      'Event quotes/invoices',
      'Startup registration proof'
    ],
    applyUrl: 'https://startupmp.mygov.co.in/'
  },
  {
    id: 25,
    name: 'MP Tender Preference for Startups',
    shortName: 'Tender Preference',
    category: 'state-government-madhya-pradesh',
    description: 'Procurement preference in state tenders by relaxing prior experience/turnover conditions.',
    fullDescription: 'Procurement preference in state tenders by relaxing prior experience/turnover conditions to help MP startups win government contracts.',
    detailedBenefits: [
      'Helps MP startups win government contracts with relaxed criteria'
    ],
    detailedEligibility: [
      'Startup registered and operational in MP with DPIIT recognition'
    ],
    applicationProcess: [
      '1. Register/verify startup on Startup MP portal',
      '2. Use registration proof when submitting tender bid',
      '3. Tendering authority evaluates with preference benefits'
    ],
    documentsRequired: [
      'Startup registration proof'
    ],
    applyUrl: 'https://startupmp.mygov.co.in/'
  },
  {
    id: 26,
    name: 'MP Incubator & Mentoring Network',
    shortName: 'Incubator Network',
    category: 'state-government-madhya-pradesh',
    description: 'Structured incubation program connecting startups with mentors, workspace, and investors.',
    fullDescription: 'Structured incubation program connecting startups with mentors, workspace, and investors through dedicated MP incubation network.',
    detailedBenefits: [
      'Mentoring from experienced entrepreneurs',
      'Workspace support and facilities',
      'Investor connect & demo platforms'
    ],
    detailedEligibility: [
      'Startup registered on Startup MP portal'
    ],
    applicationProcess: [
      '1. Register on Startup MP portal',
      '2. Apply under Incubator & Mentoring Network',
      '3. Submit business plan, team details',
      '4. Incubator reviews and onboards selected startups'
    ],
    documentsRequired: [
      'Startup KYC',
      'Pitch deck'
    ],
    applyUrl: 'https://startupmp.mygov.co.in/'
  },
  {
    id: 27,
    name: 'MP Utility/Lease Subsidy',
    shortName: 'Lease Subsidy',
    category: 'state-government-madhya-pradesh',
    description: 'Partial reimbursement of office lease and utility costs for eligible MP startups.',
    fullDescription: 'Partial reimbursement of office lease and utility costs for eligible MP startups to reduce operating expenses.',
    detailedBenefits: [
      'Reduces operating expenses through state subsidy'
    ],
    detailedEligibility: [
      'DPIIT-recognized startup operational in MP'
    ],
    applicationProcess: [
      '1. Login on Startup MP portal',
      '2. Go to Utility/Lease Subsidy section',
      '3. Upload lease agreement & utility bills',
      '4. Submit for verification and approval',
      '5. Subsidy is disbursed post-approval'
    ],
    documentsRequired: [
      'Lease agreement',
      'Utility bills'
    ],
    applyUrl: 'https://startupmp.mygov.co.in/'
  }
];


const seedSchemes = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');

    await Scheme.deleteMany({});
    console.log('🗑️  Existing schemes deleted');

    await Scheme.insertMany(schemesData);
    console.log(`✅ ${schemesData.length} schemes inserted successfully!`);

    await mongoose.connection.close();
    console.log('👋 Database connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedSchemes();