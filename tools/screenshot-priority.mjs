// Capture order for guides that require screenshots. Keep related Fidelity and
// Schwab journeys adjacent so a complete guide can be finished before moving on.
export const SCREENSHOT_GUIDE_PRIORITY = [
  'fidelity-open-roth-ira','schwab-open-roth-ira',
  'fidelity-buy-index-fund','schwab-buy-index-fund',
  'fidelity-rollover-401k','schwab-rollover-401k',
  'fidelity-tour','schwab-tour',
  'fidelity-transfer-money','schwab-transfer-money',
  'fidelity-security','schwab-security',
  'fidelity-open-brokerage','schwab-open-brokerage',
  'fidelity-open-trad-ira','schwab-open-trad-ira',
  'fidelity-recurring','schwab-recurring',
  'fidelity-open-cma','schwab-open-checking',
  'fidelity-change-core','schwab-cash-sweep',
  'fidelity-beneficiaries','schwab-beneficiaries',
  'fidelity-buy-etf','schwab-buy-etf',
  'fidelity-buy-stock','schwab-buy-stock',
  'fidelity-sell','schwab-sell',
  'fidelity-withdraw','schwab-withdraw',
  'fidelity-direct-deposit','schwab-direct-deposit',
  'fidelity-tax-docs','schwab-tax-docs',
  'fidelity-acats-in','schwab-acats-in',
  'fidelity-open-hsa',
  'fidelity-open-529','schwab-open-529',
  'fidelity-open-custodial','schwab-open-custodial',
  'fidelity-open-self-employed','schwab-open-self-employed',
  'fidelity-buy-treasury','schwab-buy-treasury',
  'fidelity-buy-cd','schwab-buy-cd',
  'fidelity-drip','schwab-drip',
  'fidelity-authorized-access','schwab-authorized-access',
  'fidelity-backdoor-roth','schwab-backdoor-roth',
  'fidelity-rmd','schwab-rmd',
  'fidelity-tlh','schwab-tlh',
  'fidelity-cost-basis','schwab-cost-basis'
];

export const screenshotGuideRank=id=>{
  const rank=SCREENSHOT_GUIDE_PRIORITY.indexOf(id);
  return rank<0?Number.MAX_SAFE_INTEGER:rank;
};
