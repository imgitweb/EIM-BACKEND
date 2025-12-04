
exports.calculateBerkus = (inputs) => {
  const { maxPerFactor = 2000000, scores = {} } = inputs;

  const totalScore =
    (scores.sound_idea || 0) +
    (scores.team || 0) +
    (scores.prototype || 0) +
    (scores.strategic_relationships || 0) +
    (scores.rollout_sales || 0);

  const valuation = (totalScore / 50) * (maxPerFactor * 5);
  return Math.round(Math.max(0, valuation));
};

exports.calculateScorecard = (inputs) => {
  const {
    baseValuation = 10000000,
    team = 5,
    market = 5,
    product = 5,
    competition = 5,
    marketing = 5,
    funding = 5
  } = inputs;

  const weights = {
    team: 0.30,
    market: 0.25,
    product: 0.15,
    competition: 0.10,
    marketing: 0.10,
    funding: 0.10
  };

  let multiplier = 0;
  Object.entries(weights).forEach(([key, weight]) => {
    const score = inputs[key] ?? 5;
    multiplier += (score / 10) * weight * 10;
  });

  return Math.round(baseValuation * multiplier);
};

exports.calculateDCF = (inputs) => {
  const {
    cf1 = 0, cf2 = 0, cf3 = 0, cf4 = 0, cf5 = 0,
    discountRate = 40,
    terminalGrowth = 3
  } = inputs;

  const r = discountRate / 100;
  const g = terminalGrowth / 100;

  if (r <= g) throw new Error("Discount rate must be > terminal growth rate");

  let pv = 0;
  [cf1, cf2, cf3, cf4, cf5].forEach((cf, i) => {
    pv += cf / Math.pow(1 + r, i + 1);
  });

  const terminalValue = cf5 * (1 + g) / (r - g);
  const pvTerminal = terminalValue / Math.pow(1 + r, 5);

  return Math.round(Math.max(0, pv + pvTerminal));
};

exports.calculateRevenueMultiple = (inputs) => {
  const { revenue = 0, multiple = 1 } = inputs;
  if (revenue < 0 || multiple <= 0) return 0;
  return Math.round(revenue * multiple);
};

exports.calculateVC = exports.calculateRevenueMultiple;
