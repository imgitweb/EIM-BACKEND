const mapCategory = (input) => {
  if (!input) return "Startup";
  const c = input.toLowerCase();

  if (c.includes("web") || c.includes("app") || c.includes("mobile"))  return "WebDev";
  if (c.includes("ai") || c.includes("data") || c.includes("automation")) return "AI";
  if (c.includes("full")) return "FullStack";
  if (c.includes("startup") || c.includes("boutique")) return "Startup";
  if (c.includes("design") || c.includes("ui") || c.includes("ux")) return "Design";
  if (c.includes("no-code") || c.includes("nocode") || c.includes("low-code")) return "NoCode";
  if (c.includes("blockchain") || c.includes("web3") || c.includes("crypto")) return "Blockchain";
  if (c.includes("marketing") || c.includes("growth")) return "MarketingTech";
  if (c.includes("studio") || c.includes("venture") || c.includes("lab")) return "ProductStudio";
  if (c.includes("ecom") || c.includes("shopify")) return "Ecom";
  if (c.includes("consult")) return "Consulting";

  return "Startup"; 
};
module.exports = mapCategory;
