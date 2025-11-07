const MAX_BERKUS_VALUATION = 25000000; 
const SCORECARD_BENCHMARK = 30000000; 
const DCF_DEFAULT_DISCOUNT_RATE = 0.20; 

const SCORECARD_WEIGHTS = {
    team: 0.30,
    problemSolution: 0.25,
    traction: 0.15,
    marketSize: 0.10,
    competition: 0.10,
    other: 0.10,
    TOTAL_WEIGHT: 1.00 
};


exports.calculateBerkus = (factors) => {
    const totalValuation = Object.values(factors).reduce((sum, current) => sum + current, 0);
    return Math.min(totalValuation, MAX_BERKUS_VALUATION);
};

exports.calculateScorecard = (inputs) => {
    const benchmark = inputs.benchmark || SCORECARD_BENCHMARK;
    
    let finalScoreSum = 0;
    
    finalScoreSum += (inputs.team / 10) * SCORECARD_WEIGHTS.team;
    finalScoreSum += (inputs.problemSolution / 10) * SCORECARD_WEIGHTS.problemSolution;
    finalScoreSum += (inputs.traction / 10) * SCORECARD_WEIGHTS.traction;
    finalScoreSum += (inputs.marketSize / 10) * SCORECARD_WEIGHTS.marketSize;
    finalScoreSum += (inputs.competition / 10) * SCORECARD_WEIGHTS.competition;
    finalScoreSum += (inputs.other / 10) * SCORECARD_WEIGHTS.other;

    return benchmark * finalScoreSum;
};


exports.calculateDCF = (inputs) => {
    let { annualRevenue, annualExpense, growthRate, projectionYears, discountRate } = inputs;

    const r = growthRate / 100; 
    const d = (discountRate / 100) || DCF_DEFAULT_DISCOUNT_RATE;
    const years = Math.min(Math.max(projectionYears, 1), 10);
    
    let presentValueSum = 0;
    let currentRevenue = annualRevenue;
    let currentExpense = annualExpense;

    for (let t = 1; t <= years; t++) {
        currentRevenue = currentRevenue * (1 + r);
        currentExpense = currentExpense * (1 + 0.10); 
        
        const profit = currentRevenue - currentExpense;
        const presentValue = profit / Math.pow(1 + d, t);
        presentValueSum += presentValue;
    }

    return Math.max(0, presentValueSum);
};


exports.calculateVC = (inputs) => {
    let { currentAnnualRevenue, investmentAmount, growthRate, yearsToExit, industryMultiple, roiMultiple } = inputs;
    
    const STARTING_ANNUAL_REVENUE = currentAnnualRevenue || 10000000; 
    
    const r = growthRate / 100;
    const years = yearsToExit;
    
    const exitRevenue = STARTING_ANNUAL_REVENUE * Math.pow(1 + r, years);

    const exitValue = exitRevenue * industryMultiple;

    if (roiMultiple <= 0) return 0;

    const targetPostMoneyValuation = exitValue / roiMultiple;

    const preMoneyValuation = targetPostMoneyValuation - investmentAmount;
    
    return Math.max(0, preMoneyValuation);
};