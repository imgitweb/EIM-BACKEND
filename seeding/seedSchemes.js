// seeders/seedSchemes.js
require('dotenv').config();
const mongoose = require('mongoose');
const Scheme = require('../models/Scheme');


const MONGO_URI = process.env.MONGO_URI
const schemesData = [
  {
    id: 1,
    name: 'Prime Minister Startup India',
    shortName: 'PM Startup',
    category: 'government-of-india',
    description: 'Comprehensive support through funding, mentoring, and networking.',
    fullDescription: 'The Prime Minister Startup India Scheme is a flagship initiative launched by the Government of India to foster innovation and entrepreneurship across the country. This comprehensive scheme provides financial support, mentoring, and networking opportunities to budding entrepreneurs.',
    detailedBenefits: [
      'Interest-free loans up to ₹10 lakhs with zero collateral',
      'Free business registration and simplified compliance procedures',
      'Complete support for patent filing and intellectual property protection',
      'Dedicated incubation support for up to 5 years',
      'Access to industry mentors and expert guidance',
      'Networking opportunities with successful entrepreneurs',
      'Free legal and financial advisory services',
      'Tax benefits and subsidies on various services'
    ],
    detailedEligibility: [
      'Company must be incorporated within the last 7 years',
      'Must be developing innovative products or services',
      'Annual turnover should be less than ₹100 crores',
      'Committed to profit generation and business growth',
      'Must be registered with the government',
      'Team should have relevant business experience',
      'Business idea should have market viability',
      'Indian entity with Indian incorporation'
    ],
    applicationProcess: [
      '1. Register on the official Startup India portal',
      '2. Create your startup profile with detailed information',
      '3. Upload necessary documents (Certificate of Incorporation, Pan Card, etc.)',
      '4. Submit your business plan and financial projections',
      '5. Wait for verification and approval from authorities',
      '6. Once approved, receive your Startup India Certificate',
      '7. Start availing benefits from day one'
    ],
    documentsRequired: [
      'Certificate of Incorporation',
      'PAN Card of the company',
      'Aadhar Card of all partners/directors',
      'Business plan and financial projections',
      'Proof of business address',
      'Bank statements (last 6 months)',
      'List of products/services offered',
      'Team resume and qualifications'
    ],
    applyUrl: 'https://www.startupindia.gov.in/'
  },
  {
    id: 2,
    name: 'Startup India Seed Fund',
    shortName: 'Seed Fund',
    category: 'government-of-india',
    description: 'Seed funding to convert ideas into prototypes and commercial products.',
    fullDescription: 'The Startup India Seed Fund Scheme provides financial assistance to help startups convert their ideas into viable prototypes and commercially successful products. This scheme is designed to bridge the gap between ideation and product development.',
    detailedBenefits: [
      'Funding ranging from ₹10 lakhs to ₹50 lakhs',
      'Support for proof of concept development',
      'Assistance with prototype testing and refinement',
      'Market validation and customer feedback analysis',
      'Business planning and strategy development',
      'Access to technical expertise and resources',
      'Mentoring from experienced startup advisors',
      'Networking with potential investors and partners'
    ],
    detailedEligibility: [
      'Registered startup with maximum 2 years of registration',
      'Technology-based or innovation-driven business',
      'Minimum ₹10 lakhs in equity required',
      'Viable business model with scalability potential',
      'Strong founding team with relevant experience',
      'Clear technology roadmap and milestones',
      'Prototype or minimum viable product available',
      'Commitment to full-time business development'
    ],
    applicationProcess: [
      '1. Ensure your startup is registered and eligible',
      '2. Prepare detailed business plan and pitch deck',
      '3. Create proof of concept or prototype',
      '4. Visit the nearest incubation center',
      '5. Submit application with required documents',
      '6. Present your idea to evaluation committee',
      '7. Receive feedback and improvement suggestions',
      '8. Final approval and fund disbursement'
    ],
    documentsRequired: [
      'Startup registration certificate',
      'Detailed business plan (5 years)',
      'Financial projections and break-even analysis',
      'Prototype or PoC documentation',
      'Team member details and CVs',
      'Market research and competitor analysis',
      'IP ownership and patent details (if any)',
      'Bank account and GSTIN details'
    ],
    applyUrl: 'https://www.startupindia.gov.in/'
  },
  {
    id: 3,
    name: 'Credit Guarantee Trust Fund',
    shortName: 'CGTMSE',
    category: 'government-of-india',
    description: 'Guarantee coverage for collateral-free loans to startups.',
    fullDescription: 'The Credit Guarantee Trust Fund for Micro and Small Enterprises (CGTMSE) is a government-backed guarantee scheme that enables micro and small enterprises to access credit from banks without submitting collateral or third-party guarantees.',
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
    id: 4,
    name: 'Pradhan Mantri Mudra',
    shortName: 'Mudra Loan',
    category: 'government-of-india',
    description: 'Loans for non-corporate, non-farm micro enterprises.',
    fullDescription: 'The Pradhan Mantri Mudra Yojana (PMMY) is a flagship scheme launched to provide loans to non-corporate and non-farm small/micro enterprises for growth and expansion without any collateral requirement.',
    detailedBenefits: [
      'Loans available from ₹50,000 to ₹10 lakhs',
      'Zero collateral requirement for loan',
      'Flexible repayment terms up to 5 years',
      'Government-backed loan security',
      'Available through all nationalized banks',
      'Competitive interest rates (typically 8-12%)',
      'Easy and quick application process',
      'Can be used for expansion and equipment purchase'
    ],
    detailedEligibility: [
      'Must be an Indian citizen',
      'Non-agricultural business enterprise',
      'No collateral security required',
      'Profit-making or viable business venture',
      'Business plan and financial documentation',
      'Not a service sector (in some cases)',
      'Age criteria: 18 years or above',
      'No prior loan defaults or negative credit history'
    ],
    applicationProcess: [
      '1. Visit your nearest bank branch',
      '2. Collect MUDRA loan application form',
      '3. Fill form with business details and loan amount',
      '4. Attach business plan and supporting documents',
      '5. Submit to bank with required photographs',
      '6. Bank verifies information and contacts you',
      '7. Loan approval and amount sanctioned',
      '8. Amount credited to your business account'
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
    applyUrl: 'https://www.startupindia.gov.in/'
  },
  {
    id: 5,
    name: 'Atal Incubation Centre',
    shortName: 'AIC',
    category: 'government-of-india',
    description: 'Comprehensive support for tech-based early-stage startups.',
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
    id: 6,
    name: 'National Startup Award',
    shortName: 'NSA',
    category: 'government-of-india',
    description: 'Recognition and awards for outstanding startup impact.',
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
    id: 7,
    name: 'SEWA Fund for Women',
    shortName: 'SEWA',
    category: 'state-government',
    description: 'Specialized support for women entrepreneurs.',
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
    id: 8,
    name: 'District Industry Centre',
    shortName: 'DIC',
    category: 'state-government',
    description: 'Local support and resources for startups and enterprises.',
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
  {
    id: 9,
    name: 'Stand Up India Scheme',
    shortName: 'Stand Up',
    category: 'government-of-india',
    description: 'Loans for SC/ST and women entrepreneurs.',
    fullDescription: 'The Stand Up India Scheme aims to promote entrepreneurship among SC/ST communities and women by providing bank loans for greenfield enterprises in the manufacturing, services, or trading sectors.',
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
    id: 10,
    name: 'Startup India IP Protection',
    shortName: 'IP Protection',
    category: 'government-of-india',
    description: 'Support for patent filings and IP protection.',
    fullDescription: 'The Startup India Intellectual Property Protection Scheme provides financial and technical support to help startups file patents, copyrights, and trademarks for their innovations and intellectual property.',
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
  {
    id: 11,
    name: 'Example International Scheme',
    shortName: 'International',
    category: 'international',
    description: 'Global opportunities for Indian startups.',
    fullDescription: 'This is an example international scheme that provides global opportunities and support for Indian startups looking to expand internationally.',
    detailedBenefits: [
      'International market access',
      'Global networking opportunities',
      'Cross-border funding support',
      'International mentorship programs'
    ],
    detailedEligibility: [
      'Registered Indian startup',
      'International expansion plans',
      'Scalable business model',
      'Strong financial records'
    ],
    applicationProcess: [
      '1. Register on the international portal',
      '2. Submit business plan',
      '3. Attend virtual interview',
      '4. Receive approval and support'
    ],
    documentsRequired: [
      'Company registration',
      'Business plan',
      'Financial statements',
      'Passport copies of founders'
    ],
    applyUrl: 'https://example-international.org/apply'
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