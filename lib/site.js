export const PRICING = {
  under30k: { essentials: 20, advisory: null },
  "30-250k": { essentials: 49, advisory: 229 },
  "250-1m": { essentials: 69, advisory: 299 },
  "1m-5m": { essentials: 99, advisory: 429 },
  "5m+": { essentials: 129, advisory: 579 },
};

export const STRIPE_LINKS = {
  under30k: {
    essentials: "https://buy.stripe.com/4gMaEWgLhaaq6xmgRn3gk00",
    advisory: "",
  },
  "30-250k": {
    essentials: "https://buy.stripe.com/8x24gy8eL6Yeg7W7gN3gk01",
    advisory: "https://buy.stripe.com/eVqeVcgLheqG8Fu6cJ3gk05",
  },
  "250-1m": {
    essentials: "https://buy.stripe.com/7sYbJ03YveqGbRGeJf3gk02",
    advisory: "https://buy.stripe.com/aFacN4eD94Q63labx33gk06",
  },
  "1m-5m": {
    essentials: "https://buy.stripe.com/4gMdR82UrdmC9Jybx33gk03",
    advisory: "https://buy.stripe.com/6oU4gy66DgyO8Fu6cJ3gk07",
  },
  "5m+": {
    essentials: "https://buy.stripe.com/8x25kC1Qn0zQ9Jy0Sp3gk04",
    advisory: "https://buy.stripe.com/6oUcN48eL3M22h67gN3gk08",
  },
};

export const INTRO_CALL_LINK =
  "https://calendly.com/lucy-foregood/new-meeting";

export const QUIZ_LINK = "https://forms.gle/Vj8GUXctRWrHs4zR6";
export const APP_LINK = "https://app.foresightgr.com.au/";

export const NEWSLETTER_ACTION_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSfdFInTlEEPJLqlKfJ5i6GmotuX5iAVSRYtNDEBY2uu3jc84Q/formResponse";
export const NEWSLETTER_EMAIL_FIELD = "entry.902983980";

export const SIZE_TABS = [
  { id: "under30k", label: "Under 30K" },
  { id: "30-250k", label: "30 - 250K" },
  { id: "250-1m", label: "250 - 1M" },
  { id: "1m-5m", label: "1M - 5M" },
  { id: "5m+", label: "5M +" },
];

export const DEFAULT_SIZE = "30-250k";

export function formatMoney(n) {
  return "$" + n.toLocaleString("en-AU");
}

export function subscribeHref(size, tier, data) {
  const priceKnown = data[tier] !== null && data[tier] !== undefined;
  const stripeUrl = (STRIPE_LINKS[size] || {})[tier];

  if (priceKnown && stripeUrl) return { href: stripeUrl, label: "Subscribe now" };
  if (!priceKnown) return { href: INTRO_CALL_LINK, label: "Contact us" };
  return { href: INTRO_CALL_LINK, label: "Subscribe now" };
}
