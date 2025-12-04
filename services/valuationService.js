const MAX_BERKUS_VALUATION = 25000000;    // ₹2.5 crore cap
const SCORECARD_BENCHMARK = 30000000;     // default ₹3 crore

const SCORECARD_WEIGHTS = {
    team: 0.30,
    opportunity: 0.25,
    productTech: 0.15,
    competition: 0.10,
    marketing: 0.10,
    funding: 0.10,
};

// ===============================================
// BERKUS METHOD (PDF-accurate)
// ===============================================
exports.calculateBerkus = (inputs) => {
    const {
        maxValue = 2000000, // default ₹20 lakh
        soundIdea = 0,
        teamQuality = 0,
        prototype = 0,
        relationships = 0,
        rollout = 0,
    } = inputs;

    const factors = [soundIdea, teamQuality, prototype, relationships, rollout];

    const total = factors.reduce((sum, score) => {
        const safeScore = Math.max(0, Math.min(score, 10)); 
        return sum + (safeScore / 10) * maxValue;
    }, 0);

    return Math.min(total, MAX_BERKUS_VALUATION);
};


// ===============================================
// SCORECARD METHOD
// ===============================================
exports.calculateScorecard = (inputs) => {
    const {
        benchmark = SCORECARD_BENCHMARK,
        team = 0,
        opportunity = 0,
        productTech = 0,
        competition = 0,
        marketing = 0,
        funding = 0,
    } = inputs;

    let multiplier =
        (team / 10) * SCORECARD_WEIGHTS.team +
        (opportunity / 10) * SCORECARD_WEIGHTS.opportunity +
        (productTech / 10) * SCORECARD_WEIGHTS.productTech +
        (competition / 10) * SCORECARD_WEIGHTS.competition +
        (marketing / 10) * SCORECARD_WEIGHTS.marketing +
        (funding / 10) * SCORECARD_WEIGHTS.funding;

    return benchmark * multiplier;
};


// ===============================================
// DCF METHOD (Matches your PDF)
// ===============================================
exports.calculateDCF = (inputs) => {
    let { cf1, cf2, cf3, cf4, cf5, discountRate, terminalGrowth } = inputs;

    const r = (discountRate || 40) / 100;
    const g = (terminalGrowth || 3) / 100;

    const cashFlows = [cf1, cf2, cf3, cf4, cf5].map(v => Math.max(0, v));

    let pvSum = 0;

    cashFlows.forEach((cf, i) => {
        pvSum += cf / Math.pow(1 + r, i + 1);
    });

    const terminalValue = (cashFlows[4] * (1 + g)) / (r - g);

    const pvTerminal = terminalValue / Math.pow(1 + r, 5);

    return Math.max(0, pvSum + pvTerminal);
};


// ===============================================
// REVENUE MULTIPLE METHOD
// ===============================================
exports.calculateRevenueMultiple = (inputs) => {
    let { revenue = 0, multiple = 1 } = inputs;
    return Math.max(0, revenue * multiple);
};
