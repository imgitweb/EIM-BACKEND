// ===============================
// Master Activity Flow
// ===============================

exports.activitiesData = [
  { activity_name: "Review Your Idea", activity_path: "/submit-idea" },
  { activity_name: "Revise Your Offering", activity_path: "/statup-offring" },
  { activity_name: "Your Success Meter", activity_path: "/idea-validation" },
  { activity_name: "Why You Might Fail?", activity_path: "/feedback-risk" },
  { activity_name: "Your Competitors", activity_path: "/rivarly-insights" },
  { activity_name: "Business Models", activity_path: "/business-model" },
  {
    activity_name: "Market Size Calculation",
    activity_path: "/market-calculation",
  },
  { activity_name: "Sales & Marketing Funnel", activity_path: "/sales-funnel" },
  { activity_name: "Marketing Campaigns", activity_path: "/marketing-funnel" },
  { activity_name: "Leads Tracks", activity_path: "/revenu-trac" },
  {
    activity_name: "Post Co-founder Requirement",
    activity_path: "/post-co-founder-requirement",
  },
  {
    activity_name: "Find Your Co-Founder",
    activity_path: "/team/cofounder-match",
  },
  { activity_name: "Post Jobs", activity_path: "/startup-Hire-team" },
  { activity_name: "Find Resources", activity_path: "/hire-resources" },
  { activity_name: "Find Mentors", activity_path: "/my-mentor" },

  { activity_name: "Define MVP Scope", activity_path: "/mvp/scope" },
  { activity_name: "MVP Backlog", activity_path: "/mvp/backlog" },
  { activity_name: "Start Building MVP", activity_path: "/mvp/builder" },
  { activity_name: "Hire MVP Team", activity_path: "/mvp/hire" },
  { activity_name: "Launch MVP", activity_path: "/product-listing" },
  { activity_name: "MVP Feedback", activity_path: "/mvp/feedback" },

  { activity_name: "Build GTM Strategy", activity_path: "/GTM-strategy" },
  {
    activity_name: "Product Launch Checklist",
    activity_path: "/build-checklist",
  },
  { activity_name: "Launch Your Product", activity_path: "/product-listing" },

  {
    activity_name: "Company Registration Options",
    activity_path: "/company-registration",
  },
  {
    activity_name: "Documentation Requirements",
    activity_path: "/company-documentation-requirements",
  },
  { activity_name: "Legal Partner Network", activity_path: "/company-legal" },
  {
    activity_name: "Compliance Dashboard",
    activity_path: "/company-compliance",
  },
  {
    activity_name: "Update Company Details",
    activity_path: "/update-company-details",
  },

  { activity_name: "Create Pitch Deck", activity_path: "/pitchdeck" },
  { activity_name: "Find Investors", activity_path: "/investors" },
  {
    activity_name: "Send Pitches & Track Replies",
    activity_path: "/send-pitches-track-replies",
  },

  {
    activity_name: "Valuation Calculator",
    activity_path: "/funding/valuation",
  },
  { activity_name: "Cap Table", activity_path: "/funding/captable" },
  {
    activity_name: "Investment Term Sheet Generator",
    activity_path: "/funding/termsheet",
  },

  {
    activity_name: "Founders Agreement & NDAs",
    activity_path: "/docs/founders",
  },
  { activity_name: "ESOP Plans & Cap Table", activity_path: "/docs/cap-table" },
  { activity_name: "HR & Intern Offer Letters", activity_path: "/docs/hr" },
  {
    activity_name: "GTM, Budget & Hiring Templates",
    activity_path: "/docs/hiring",
  },
  { activity_name: "All Downloadable", activity_path: "/docs/all" },

  { activity_name: "Set Vision & Goals", activity_path: "/path-unicorn" },
  { activity_name: "Milestone Builder", activity_path: "/path-unicorn2" },

  { activity_name: "Revenue, Burn, CAC, LTV", activity_path: "/projection" },
  { activity_name: "Runway Calculator", activity_path: "/runway-calculator" },
];

// ===============================
// Stage-based Hard Locks
// ===============================

exports.stagedefaltfalseActivityMap = {
  alpha: [
    "/submit-idea",
    "/idea-validation",
    "/feedback-risk",
    "/rivarly-insights",
    "/business-model",
    "/statup-offring",
    "/market-calculation",
    "/path-unicorn",
    "/path-unicorn2",
    "/post-co-founder-requirement",
    "/team/cofounder-match",
    "/my-mentor",
    "/docs/founders",
    "/docs/hr",
    "/docs/hiring",
    "/docs/all",
  ],
  beta: [
    "/mvp/scope",
    "/mvp/backlog",
    "/mvp/builder",
    "/mvp/hire",
    "/product-listing",
    "/mvp/feedback",
    "/GTM-strategy",
    "/build-checklist",
    "/sales-funnel",
    "/marketing-funnel",
    "/revenu-trac",
    "/startup-Hire-team",
    "/hire-resources",
    "/projection",
    "/runway-calculator",
  ],
  gamma: [
    "/company-registration",
    "/company-documentation-requirements",
    "/company-legal",
    "/company-compliance",
    "/update-company-details",
    "/pitchdeck",
    "/investors",
    "/send-pitches-track-replies",
  ],
  sigma: [
    "/funding/valuation",
    "/funding/captable",
    "/funding/termsheet",
    "/docs/cap-table",
  ],
};
