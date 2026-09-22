export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://foresightgr.com.au";
export const SITE_NAME = "FOREsight";
export const SITE_TITLE =
  "Government relations for for-purpose organisations | FOREsight";
export const SITE_DESCRIPTION =
  "FOREsight gives for-purpose organisations the templates, intelligence and expert access to run their own government relations, without hiring a GR team.";
export const PARENT_ORG_NAME = "FORE Good";
export const PARENT_ORG_URL = "https://www.foregood.org.au";
export const SITE_EMAIL = "hello@foregood.org.au";

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
// so each intro-call booking can be attributed to the option (and revenue
// band) the visitor chose.
export const PRICING_EXPERIMENT = "pricing-3way-sep26";

// Subscribe plans. `priceKey` is the field on PRICING / STRIPE_LINKS;
// `calendly` is the utm_content used when that plan has no public price
// (Contact us).
export const SUBSCRIBE_PLANS = {
  essentials: { priceKey: "essentials", calendly: "essentials" },
  guided: { priceKey: "advisory", calendly: "guided" },
  pack: { priceKey: "pack", calendly: "campaign-pack" },
};

// Temporary: subscribe links go straight to Stripe Payment Links again while
// the app's own checkout flow (deep-link via APP_LINK) doesn't yet handle the
// `subscribe`/`band` query params. Switch subscribeHref() back to APP_LINK
// once that's built.
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
export const APP_SIGNUP_LINK = "https://app.foresightgr.com.au/?auth=signup";

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

// Stripe client_reference_id only allows [A-Za-z0-9_-], max 200 chars.
function experimentRef(plan, size) {
  return `${PRICING_EXPERIMENT}_${plan}_${size}`
    .replace(/[^A-Za-z0-9_-]/g, "")
    .slice(0, 200);
}

// Routes Subscribe straight to the matching Stripe Payment Link. Guided and
// Campaign Pack at under30k have no public price - those stay Contact us /
// Calendly, as does any plan whose Stripe link isn't configured yet.
export function subscribeHref(size, plan, data) {
  const meta = SUBSCRIBE_PLANS[plan];
  const priceKey = meta?.priceKey || plan;
  const priceKnown = data[priceKey] !== null && data[priceKey] !== undefined;
  const calendlyOption = meta?.calendly || plan;
  const stripeUrl = (STRIPE_LINKS[size] || {})[priceKey];

  if (priceKnown && stripeUrl) {
    return {
      href: withParams(stripeUrl, {
        client_reference_id: experimentRef(plan, size),
      }),
      label: "Subscribe now",
    };
  }
  if (!priceKnown) {
    return { href: introCallHref(calendlyOption, size), label: "Contact us" };
  }
  return { href: introCallHref(calendlyOption, size), label: "Subscribe now" };
}
