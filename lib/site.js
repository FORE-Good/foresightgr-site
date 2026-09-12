// `pack` is a one-off price for a 3-month Campaign Pack (~3x the Guided
// monthly, rounded) so "you've already paid for 3 months of Guided" holds.
export const PRICING = {
  under30k: { essentials: 20, advisory: null, pack: null },
  "30-250k": { essentials: 49, advisory: 229, pack: 690 },
  "250-1m": { essentials: 69, advisory: 299, pack: 895 },
  "1m-5m": { essentials: 99, advisory: 429, pack: 1290 },
  "5m+": { essentials: 129, advisory: 579, pack: 1740 },
};

// Name of the current pricing experiment. Lands in Calendly as utm_campaign
// and in Stripe as part of client_reference_id, so each booking/checkout can
// be attributed to the option (and revenue band) the visitor chose.
export const PRICING_EXPERIMENT = "pricing-3way-sep26";

export const STRIPE_LINKS = {
  under30k: {
    essentials: "https://buy.stripe.com/4gMaEWgLhaaq6xmgRn3gk00",
    advisory: "",
    pack: "",
  },
  "30-250k": {
    essentials: "https://buy.stripe.com/8x24gy8eL6Yeg7W7gN3gk01",
    advisory: "https://buy.stripe.com/eVqeVcgLheqG8Fu6cJ3gk05",
    pack: "https://buy.stripe.com/7sY3cu1QnfuK9JyasZ3gk09",
  },
  "250-1m": {
    essentials: "https://buy.stripe.com/7sYbJ03YveqGbRGeJf3gk02",
    advisory: "https://buy.stripe.com/aFacN4eD94Q63labx33gk06",
    pack: "https://buy.stripe.com/14AcN452z82i7Bq1Wt3gk0a",
  },
  "1m-5m": {
    essentials: "https://buy.stripe.com/4gMdR82UrdmC9Jybx33gk03",
    advisory: "https://buy.stripe.com/6oU4gy66DgyO8Fu6cJ3gk07",
    pack: "https://buy.stripe.com/fZu6oGeD9eqGdZOfNj3gk0b",
  },
  "5m+": {
    essentials: "https://buy.stripe.com/8x25kC1Qn0zQ9Jy0Sp3gk04",
    advisory: "https://buy.stripe.com/6oUcN48eL3M22h67gN3gk08",
    pack: "https://buy.stripe.com/3cI3cu1QndmC2h6bx33gk0c",
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

export function withParams(url, params) {
  const u = new URL(url);
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined && value !== "") {
      u.searchParams.set(key, String(value));
    }
  }
  return u.toString();
}

// Stripe client_reference_id only allows [A-Za-z0-9_-], max 200 chars.
function experimentRef(option, size) {
  return `${PRICING_EXPERIMENT}_${option}_${size}`
    .replace(/[^A-Za-z0-9_-]/g, "")
    .slice(0, 200);
}

// Calendly keeps UTM params against the booking, so which card the visitor
// clicked (utm_content) and their revenue band (utm_term) show up in the
// event details / export without any analytics tooling.
export function introCallHref(option, size) {
  return withParams(INTRO_CALL_LINK, {
    utm_source: "foresightgr.com.au",
    utm_medium: "pricing",
    utm_campaign: PRICING_EXPERIMENT,
    utm_content: option,
    utm_term: size,
  });
}

// `tier` is the key in PRICING / STRIPE_LINKS; `option` is the public name
// used in tracking (defaults to tier). Lets "advisory" be tracked as "guided".
export function subscribeHref(size, tier, data, option = tier) {
  const priceKnown = data[tier] !== null && data[tier] !== undefined;
  const stripeUrl = (STRIPE_LINKS[size] || {})[tier];

  if (priceKnown && stripeUrl) {
    return {
      href: withParams(stripeUrl, {
        client_reference_id: experimentRef(option, size),
      }),
      label: "Subscribe now",
    };
  }
  if (!priceKnown) {
    return { href: introCallHref(option, size), label: "Contact us" };
  }
  return { href: introCallHref(option, size), label: "Subscribe now" };
}
