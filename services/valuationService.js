exports.calculateBerkus = (inputs) => {
  // Map your inputs
  const maxPerFactor = inputs.maxValue || 2000000;

  const scores = {
    sound_idea: inputs.soundIdea || 0,
    team: inputs.teamQuality || 0,
    prototype: inputs.prototype || 0,
    strategic_relationships: inputs.relationships || 0,
    rollout_sales: inputs.rollout || 0,
  };

  // Calculate total score
  const totalScore =
    scores.sound_idea +
    scores.team +
    scores.prototype +
    scores.strategic_relationships +
    scores.rollout_sales;

  // Calculate valuation
  const valuation = (totalScore / 10) * maxPerFactor;
  

  return Math.round(Math.max(0, valuation));
};


exports.calculateScorecard = (inputs) => {
 const {
    benchmark = 10000000,
    team = 0,
    opportunity = 0,
    productTech = 0,
    competition = 0,
    marketing = 0,
    funding = 0
  } = inputs;

  // Weights (must total 1.0)
  const weights = {
    team: 0.30,
    opportunity: 0.25,
    productTech: 0.15,
    competition: 0.10,
    marketing: 0.10,
    funding: 0.10
  };

  
  let multiplier =
    (team / 10) * weights.team +
    (opportunity / 10) * weights.opportunity +
    (productTech / 10) * weights.productTech +
    (competition / 10) * weights.competition +
    (marketing / 10) * weights.marketing +
    (funding / 10) * weights.funding;

  
  const valuation = benchmark * multiplier;

  return Math.round(Math.max(0, valuation));
};




exports.calculateDCF = (inputs) => {
  console.log('DCF Inputs:', inputs);
  const {
    cf1 = 0, cf2 = 0, cf3 = 0, cf4 = 0, cf5 = 0,
    discountRate = 40,
    terminalGrowth = 3
  } = inputs;

  const r = discountRate / 100;
  const g = terminalGrowth / 100;

  if (r <= g) throw new Error("Discount rate must be > terminal growth rate");


  const pv1 = cf1 / Math.pow(1 + r, 1);
  const pv2 = cf2 / Math.pow(1 + r, 2);
  const pv3 = cf3 / Math.pow(1 + r, 3);
  const pv4 = cf4 / Math.pow(1 + r, 4);
  const pv5 = cf5 / Math.pow(1 + r, 5);

  const terminalValue = cf5 * (1 + g) / (r - g);
  const pvTerminal = terminalValue / Math.pow(1 + r, 5);

  const valuation = pv1 + pv2 + pv3 + pv4 + pv5 + pvTerminal;
  

  return Math.round(Math.max(0, valuation));
};



exports.calculateRevenueMultiple = (inputs) => {
  console.log('Revenue Multiple Inputs:', inputs);
  const { revenue = 0, multiple = 1 } = inputs;
  if (revenue < 0 || multiple <= 0) return 0;
  return Math.round(revenue * multiple);
};

